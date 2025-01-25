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

  // NOTE: FUNCTION WORKS PERFECTLY, IT IS FORMAT AND HOW IT IS BEING CALLED THATS THE ISSUE
  @Post('/:requestId/confirm-delivery')
  async confirmDelivery(
    @Param('requestId', ParseIntPipe) requestId: number,
    @Body()
    body: {
      deliveryDate: Date;
      feedback: string;
      photos: string[];
    },
  ): Promise<FoodRequest> {
    console.log('Entered confirmDelivery function');
    console.log('Request ID:', requestId);
    console.log('Body:', body);

    return this.requestsService.updateDeliveryDetails(
      requestId,
      body.deliveryDate,
      body.feedback,
      body.photos,
    );
  }
}
