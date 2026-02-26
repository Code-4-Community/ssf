import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { RequestsService } from './request.service';
import { FoodRequest } from './request.entity';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../users/types';
import { RequestSize } from './types';
import { OrderDetailsDto } from './dtos/order-details.dto';

@Controller('requests')
export class RequestsController {
  constructor(private requestsService: RequestsService) {}

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
    );
  }
}
