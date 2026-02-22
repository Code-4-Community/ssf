import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Body,
  UploadedFiles,
  UseInterceptors,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { RequestsService } from './request.service';
import { FoodRequest } from './request.entity';
import { AWSS3Service } from '../aws/aws-s3.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../users/types';
import { OrdersService } from '../orders/order.service';
import { RequestSize } from './types';
import { OrderStatus } from '../orders/types';
import { OrderDetailsDto } from './dtos/order-details.dto';

@Controller('requests')
export class RequestsController {
  constructor(
    private requestsService: RequestsService,
    private awsS3Service: AWSS3Service,
    private ordersService: OrdersService,
  ) {}

  @Roles(Role.PANTRY, Role.ADMIN)
  @Get('/:requestId')
  async getRequest(
    @Param('requestId', ParseIntPipe) requestId: number,
  ): Promise<FoodRequest> {
    return this.requestsService.findOne(requestId);
  }

  @Roles(Role.PANTRY, Role.ADMIN)
  @Get('/:pantryId/all')
  async getAllPantryRequests(
    @Param('pantryId', ParseIntPipe) pantryId: number,
  ): Promise<FoodRequest[]> {
    return this.requestsService.find(pantryId);
  }

  @Get('/:requestId/order-details')
  async getAllOrderDetailsFromRequest(
    @Param('requestId', ParseIntPipe) requestId: number,
  ): Promise<OrderDetailsDto[]> {
    return this.requestsService.getOrderDetails(requestId);
  }

  @Post('/create')
  @ApiBody({
    description: 'Details for creating a food request',
    schema: {
      type: 'object',
      properties: {
        pantryId: { type: 'integer', example: 1 },
        requestedSize: {
          type: 'string',
          enum: Object.values(RequestSize),
          example: RequestSize.LARGE,
        },
        requestedItems: {
          type: 'array',
          items: { type: 'string' },
          example: ['Rice Noodles', 'Quinoa'],
        },
        additionalInformation: {
          type: 'string',
          nullable: true,
          example: 'Urgent request',
        },
        dateReceived: {
          type: 'string',
          format: 'date-time',
          nullable: true,
          example: null,
        },
        feedback: { type: 'string', nullable: true, example: null },
        photos: {
          type: 'array',
          items: { type: 'string' },
          nullable: true,
          example: [],
        },
      },
    },
  })
  async createRequest(
    @Body()
    body: {
      pantryId: number;
      requestedSize: RequestSize;
      requestedItems: string[];
      additionalInformation: string;
      dateReceived: Date;
      feedback: string;
      photos: string[];
    },
  ): Promise<FoodRequest> {
    if (
      !Object.values(RequestSize).includes(body.requestedSize as RequestSize)
    ) {
      throw new BadRequestException('Invalid request size');
    }
    return this.requestsService.create(
      body.pantryId,
      body.requestedSize,
      body.requestedItems,
      body.additionalInformation,
      body.dateReceived,
      body.feedback,
      body.photos,
    );
  }

  @Roles(Role.PANTRY, Role.ADMIN)
  //TODO: delete endpoint, here temporarily as a logic reference for order status impl.
  @Post('/:requestId/confirm-delivery')
  @ApiBody({
    description: 'Details for a confirmation form',
    schema: {
      type: 'object',
      properties: {
        dateReceived: {
          type: 'string',
          format: 'date-time',
          nullable: true,
          example: new Date().toISOString(),
        },
        feedback: {
          type: 'string',
          nullable: true,
          example: 'Wonderful shipment!',
        },
        photos: {
          type: 'array',
          items: { type: 'string' },
          nullable: true,
          example: [],
        },
      },
    },
  })
  @UseInterceptors(
    FilesInterceptor('photos', 10, { storage: multer.memoryStorage() }),
  )
  async confirmDelivery(
    @Param('requestId', ParseIntPipe) requestId: number,
    @Body() body: { dateReceived: string; feedback: string },
    @UploadedFiles() photos?: Express.Multer.File[],
  ): Promise<FoodRequest> {
    const formattedDate = new Date(body.dateReceived);
    if (isNaN(formattedDate.getTime())) {
      throw new Error('Invalid date format for deliveryDate');
    }

    const uploadedPhotoUrls =
      photos && photos.length > 0 ? await this.awsS3Service.upload(photos) : [];

    const updatedRequest = await this.requestsService.updateDeliveryDetails(
      requestId,
      formattedDate,
      body.feedback,
      uploadedPhotoUrls,
    );

    if (!updatedRequest) {
      throw new NotFoundException('Invalid request ID');
    }

    if (!updatedRequest.orders || updatedRequest.orders.length == 0) {
      throw new NotFoundException(
        'No associated orders found for this request',
      );
    }

    await Promise.all(
      updatedRequest.orders.map((order) =>
        this.ordersService.updateStatus(order.orderId, OrderStatus.DELIVERED),
      ),
    );

    return updatedRequest;
  }
}
