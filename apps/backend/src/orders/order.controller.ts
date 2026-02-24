import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  ParseIntPipe,
  Body,
  Query,
  BadRequestException,
  ValidationPipe,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { OrdersService } from './order.service';
import { Order } from './order.entity';
import { Pantry } from '../pantries/pantries.entity';
import { FoodManufacturer } from '../foodManufacturers/manufacturers.entity';
import { FoodRequest } from '../foodRequests/request.entity';
import { AllocationsService } from '../allocations/allocations.service';
import { OrderStatus } from './types';
import { TrackingCostDto } from './dtos/tracking-cost.dto';
import { AWSS3Service } from '../aws/aws-s3.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';
import { ConfirmDeliveryDto } from './dtos/confirm-delivery.dto';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly allocationsService: AllocationsService,
    private readonly awsS3Service: AWSS3Service,
  ) {}

  // Called like: /?status=pending&pantryName=Test%20Pantry&pantryName=Test%20Pantry%202
  // %20 is the URL encoded space character
  // This gets all orders where the status is pending and the pantry name is either Test Pantry or Test Pantry 2
  @Get('/')
  async getAllOrders(
    @Query('status') status?: string,
    @Query('pantryName') pantryNames?: string | string[],
  ): Promise<Order[]> {
    if (typeof pantryNames === 'string') {
      pantryNames = [pantryNames];
    }
    return this.ordersService.getAll({ status, pantryNames });
  }

  @Get('/get-current-orders')
  async getCurrentOrders(): Promise<Order[]> {
    return this.ordersService.getCurrentOrders();
  }

  @Get('/get-past-orders')
  async getPastOrders(): Promise<Order[]> {
    return this.ordersService.getPastOrders();
  }

  @Get('/:orderId/pantry')
  async getPantryFromOrder(
    @Param('orderId', ParseIntPipe) orderId: number,
  ): Promise<Pantry> {
    return this.ordersService.findOrderPantry(orderId);
  }

  @Get('/:orderId/request')
  async getRequestFromOrder(
    @Param('orderId', ParseIntPipe) orderId: number,
  ): Promise<FoodRequest> {
    return this.ordersService.findOrderFoodRequest(orderId);
  }

  @Get('/:orderId/manufacturer')
  async getManufacturerFromOrder(
    @Param('orderId', ParseIntPipe) orderId: number,
  ): Promise<FoodManufacturer> {
    return this.ordersService.findOrderFoodManufacturer(orderId);
  }

  @Get('/:orderId')
  async getOrder(
    @Param('orderId', ParseIntPipe) orderId: number,
  ): Promise<Order> {
    return this.ordersService.findOne(orderId);
  }

  @Get('/order/:requestId')
  async getOrderByRequestId(
    @Param('requestId', ParseIntPipe) requestId: number,
  ): Promise<Order> {
    return this.ordersService.findOrderByRequest(requestId);
  }

  @Get('/:orderId/allocations')
  async getAllAllocationsByOrder(
    @Param('orderId', ParseIntPipe) orderId: number,
  ) {
    return this.allocationsService.getAllAllocationsByOrder(orderId);
  }

  @Patch('/update-status/:orderId')
  async updateStatus(
    @Param('orderId', ParseIntPipe) orderId: number,
    @Body('newStatus') newStatus: string,
  ): Promise<void> {
    if (!Object.values(OrderStatus).includes(newStatus as OrderStatus)) {
      throw new BadRequestException('Invalid status');
    }
    return this.ordersService.updateStatus(orderId, newStatus as OrderStatus);
  }

  @Patch('/:orderId/update-tracking-cost-info')
  async updateTrackingCostInfo(
    @Param('orderId', ParseIntPipe) orderId: number,
    @Body(new ValidationPipe())
    dto: TrackingCostDto,
  ): Promise<void> {
    return this.ordersService.updateTrackingCostInfo(orderId, dto);
  }

  @Patch('/:orderId/confirm-delivery')
  @ApiBody({
    description: 'Details for a confirmation form',
    schema: {
      type: 'object',
      properties: {
        dateReceived: {
          type: 'string',
          format: 'date-time',
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
    @Param('orderId', ParseIntPipe) orderId: number,
    @Body() body: ConfirmDeliveryDto,
    @UploadedFiles() photos?: Express.Multer.File[],
  ): Promise<Order> {
    const uploadedPhotoUrls =
      photos && photos.length > 0 ? await this.awsS3Service.upload(photos) : [];

    return this.ordersService.confirmDelivery(orderId, body, uploadedPhotoUrls);
  }
}
