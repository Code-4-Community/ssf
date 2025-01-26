import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Patch,
  Body,
  Put,
} from '@nestjs/common';
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
