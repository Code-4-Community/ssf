import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Body,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { RequestsService } from './request.service';
import { FoodRequest } from './request.entity';
import { AWSS3Service } from '../aws/aws-s3.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';

@Controller('requests')
// @UseInterceptors()
export class FoodRequestsController {
  constructor(
    private requestsService: RequestsService,
    private awsS3Service: AWSS3Service,
  ) {}

  @Get('/:pantryId')
  async getAllPantryRequests(
    @Param('pantryId', ParseIntPipe) pantryId: number,
  ): Promise<FoodRequest[]> {
    return this.requestsService.find(pantryId);
  }

  @Post('/create')
  @ApiBody({
    description: 'Details for creating a food request',
    schema: {
      type: 'object',
      properties: {
        pantryId: { type: 'integer', example: 1 },
        requestedSize: { type: 'string', example: 'Medium (5-10 boxes)' },
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
        status: { type: 'string', example: 'pending' },
        fulfilledBy: { type: 'integer', nullable: true, example: null },
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
      requestedSize: string;
      requestedItems: string[];
      additionalInformation: string;
      status: string;
      fulfilledBy: number;
      dateReceived: Date;
      feedback: string;
      photos: string[];
    },
  ): Promise<FoodRequest> {
    return this.requestsService.create(
      body.pantryId,
      body.requestedSize,
      body.requestedItems,
      body.additionalInformation,
      body.status,
      body.fulfilledBy,
      body.dateReceived,
      body.feedback,
      body.photos,
    );
  }

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
    @UploadedFiles() photos: Express.Multer.File[],
  ): Promise<FoodRequest> {
    if (!photos || photos.length === 0) {
      console.error('No files uploaded');
      throw new Error('No photos uploaded');
    }

    const formattedDate = new Date(body.dateReceived);
    if (isNaN(formattedDate.getTime())) {
      console.error('Invalid Date:', body.dateReceived);
      throw new Error('Invalid date format for deliveryDate');
    }

    const uploadedPhotoUrls = await this.awsS3Service.upload(photos);

    return this.requestsService.updateDeliveryDetails(
      requestId,
      formattedDate,
      body.feedback,
      uploadedPhotoUrls,
    );
  }
}
