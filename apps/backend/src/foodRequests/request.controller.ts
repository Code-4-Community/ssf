import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Body,
} from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { RequestsService } from './request.service';
import { FoodRequest } from './request.entity';

@Controller('requests')
//@UseInterceptors()
export class FoodRequestsController {
  constructor(private requestsService: RequestsService) {}

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
  async confirmDelivery(
    @Param('requestId', ParseIntPipe) requestId: number,
    @Body()
    body: {
      dateReceived: string;
      feedback: string;
      photos: string[];
    },
  ): Promise<FoodRequest> {
    const formattedDate = new Date(body.dateReceived);
    if (formattedDate.toString() === 'Invalid Date') {
      console.error('Invalid Date:', body.dateReceived);
      throw new Error('Invalid date format for deliveryDate');
    }

    return this.requestsService.updateDeliveryDetails(
      requestId,
      formattedDate,
      body.feedback,
      body.photos,
    );
  }
}
