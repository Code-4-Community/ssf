import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Body,
  ValidationPipe,
  Patch,
} from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { RequestsService } from './request.service';
import { FoodRequest } from './request.entity';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../users/types';
import { RequestSize } from './types';
import { FoodRequestSummaryDto } from './dtos/food-request-summary.dto';
import { OrderDetailsDto } from '../orders/dtos/order-details.dto';
import { CreateRequestDto } from './dtos/create-request.dto';
import { FoodType } from '../donationItems/types';
import {
  MatchingItemsDto,
  MatchingManufacturersDto,
} from './dtos/matching.dto';
import {
  CheckOwnership,
  OwnerIdResolver,
  pipeNullable,
} from '../auth/ownership.decorator';
import { PantriesService } from '../pantries/pantries.service';
import { Pantry } from '../pantries/pantries.entity';

// PANTRY users may access requests belonging to their own pantry (matched by
// pantry representative id). All other non-admin callers (i.e. VOLUNTEER) must
// be in the pantry's assigned volunteers list. ADMIN bypasses in the guard.
const resolveRequestAuthorizedUserIds: OwnerIdResolver = ({
  entityId,
  services,
  user,
}) =>
  pipeNullable(
    () => services.get(RequestsService).findOne(entityId),
    (request: FoodRequest) =>
      services.get(PantriesService).findOne(request.pantryId),
    (pantry: Pantry) =>
      user?.role === Role.PANTRY
        ? [pantry.pantryUser.id]
        : (pantry.volunteers ?? []).map((v) => v.id),
  );

@Controller('requests')
export class RequestsController {
  constructor(private requestsService: RequestsService) {}

  @Roles(Role.ADMIN)
  @Get()
  async getAllFoodRequests(): Promise<FoodRequestSummaryDto[]> {
    return this.requestsService.getAll();
  }

  @CheckOwnership({
    idParam: 'requestId',
    resolver: resolveRequestAuthorizedUserIds,
  })
  @Roles(Role.PANTRY, Role.ADMIN, Role.VOLUNTEER)
  @Get('/:requestId')
  async getRequest(
    @Param('requestId', ParseIntPipe) requestId: number,
  ): Promise<FoodRequest> {
    return this.requestsService.findOne(requestId);
  }

  @CheckOwnership({
    idParam: 'requestId',
    resolver: resolveRequestAuthorizedUserIds,
  })
  @Roles(Role.VOLUNTEER, Role.PANTRY, Role.ADMIN)
  @Get('/:requestId/order-details')
  async getAllOrderDetailsFromRequest(
    @Param('requestId', ParseIntPipe) requestId: number,
  ): Promise<OrderDetailsDto[]> {
    return this.requestsService.getOrderDetails(requestId);
  }

  @CheckOwnership({
    idParam: 'requestId',
    resolver: resolveRequestAuthorizedUserIds,
  })
  @Roles(Role.ADMIN, Role.VOLUNTEER)
  @Get('/:requestId/matching-manufacturers')
  async getMatchingManufacturers(
    @Param('requestId', ParseIntPipe) requestId: number,
  ): Promise<MatchingManufacturersDto> {
    return this.requestsService.getMatchingManufacturers(requestId);
  }

  @CheckOwnership({
    idParam: 'requestId',
    resolver: resolveRequestAuthorizedUserIds,
  })
  @Roles(Role.ADMIN, Role.VOLUNTEER)
  @Get('/:requestId/matching-manufacturers/:manufacturerId/available-items')
  async getAvailableItemsForManufacturer(
    @Param('requestId', ParseIntPipe) requestId: number,
    @Param('manufacturerId', ParseIntPipe) manufacturerId: number,
  ): Promise<MatchingItemsDto> {
    return this.requestsService.getAvailableItems(requestId, manufacturerId);
  }

  @Roles(Role.ADMIN, Role.PANTRY)
  @Post()
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

  @CheckOwnership({
    idParam: 'requestId',
    resolver: resolveRequestAuthorizedUserIds,
  })
  @Roles(Role.VOLUNTEER)
  @Patch('/:requestId/close')
  async closeRequest(
    @Param('requestId', ParseIntPipe) requestId: number,
  ): Promise<void> {
    await this.requestsService.closeRequest(requestId);
  }
}
