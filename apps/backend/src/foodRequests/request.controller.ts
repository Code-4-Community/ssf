import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Body,
  ValidationPipe,
  Patch,
  Delete,
} from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { RequestsService } from './request.service';
import { FoodRequest } from './request.entity';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../users/types';
import { RequestSize } from './types';
import { OrderDetailsDto } from '../orders/dtos/order-details.dto';
import { CreateRequestDto } from './dtos/create-request.dto';
import { FoodType } from '../donationItems/types';
import {
  MatchingItemsDto,
  MatchingManufacturersDto,
} from './dtos/matching.dto';
import { UpdateRequestDto } from './dtos/update-request.dto';

@Controller('requests')
export class RequestsController {
  constructor(private requestsService: RequestsService) {}

  @Roles(Role.ADMIN)
  @Get()
  async getAllFoodRequests(): Promise<FoodRequest[]> {
    return this.requestsService.getAll();
  }

  @Roles(Role.PANTRY, Role.ADMIN, Role.VOLUNTEER)
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

  @Roles(Role.VOLUNTEER, Role.PANTRY, Role.ADMIN)
  @Get('/:requestId/order-details')
  async getAllOrderDetailsFromRequest(
    @Param('requestId', ParseIntPipe) requestId: number,
  ): Promise<OrderDetailsDto[]> {
    return this.requestsService.getOrderDetails(requestId);
  }

  @Roles(Role.VOLUNTEER)
  @Get('/:requestId/matching-manufacturers')
  async getMatchingManufacturers(
    @Param('requestId', ParseIntPipe) requestId: number,
  ): Promise<MatchingManufacturersDto> {
    return this.requestsService.getMatchingManufacturers(requestId);
  }

  @Roles(Role.VOLUNTEER)
  @Get('/:requestId/matching-manufacturers/:manufacturerId/available-items')
  async getAvailableItemsForManufacturer(
    @Param('requestId', ParseIntPipe) requestId: number,
    @Param('manufacturerId', ParseIntPipe) manufacturerId: number,
  ): Promise<MatchingItemsDto> {
    return this.requestsService.getAvailableItems(requestId, manufacturerId);
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
        requestedFoodTypes: {
          type: 'array',
          items: { type: 'string', enum: Object.values(FoodType) },
          example: [FoodType.DAIRY_FREE_ALTERNATIVES, FoodType.DRIED_BEANS],
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
    @Body(new ValidationPipe())
    requestData: CreateRequestDto,
  ): Promise<FoodRequest> {
    return this.requestsService.create(
      requestData.pantryId,
      requestData.requestedSize,
      requestData.requestedFoodTypes,
      requestData.additionalInformation,
    );
  }

  @Patch('/:requestId')
  async updateRequest(
    @Param('requestId', ParseIntPipe) requestId: number,
    @Body(new ValidationPipe()) body: UpdateRequestDto,
  ): Promise<FoodRequest> {
    return this.requestsService.update(requestId, body);
  }

  @Delete('/:requestId')
  async deleteRequest(
    @Param('requestId', ParseIntPipe) requestId: number,
  ): Promise<void> {
    return this.requestsService.delete(requestId);
  }
}
