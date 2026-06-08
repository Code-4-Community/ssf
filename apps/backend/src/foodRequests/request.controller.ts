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
import { UpdateRequestDto } from './dtos/update-request.dto';

// PANTRY users may access requests belonging to their own pantry (matched by
// pantry representative id). All other non-admin callers (i.e. VOLUNTEER) must
// be in the pantry's assigned volunteers list. ADMIN bypasses in the guard.
export const resolveRequestAuthorizedUserIds: OwnerIdResolver = ({
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

// For creating a request, the pantryId comes from the request body and the
// only authorized non-admin caller is the pantry representative.
export const resolveCreateRequestAuthorizedUserIds: OwnerIdResolver = ({
  entityId,
  services,
}) =>
  pipeNullable(
    () => services.get(PantriesService).findOne(entityId),
    (pantry: Pantry) => [pantry.pantryUser.id],
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

  @CheckOwnership({
    idParam: 'pantryId',
    idSource: 'body',
    resolver: resolveCreateRequestAuthorizedUserIds,
  })
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

  @Roles(Role.PANTRY)
  @CheckOwnership({
    idParam: 'requestId',
    resolver: resolveRequestAuthorizedUserIds,
  })
  @Patch('/:requestId')
  async updateRequest(
    @Param('requestId', ParseIntPipe) requestId: number,
    @Body(new ValidationPipe()) body: UpdateRequestDto,
  ): Promise<void> {
    await this.requestsService.update(requestId, body);
  }

  @Roles(Role.ADMIN, Role.VOLUNTEER, Role.PANTRY)
  @CheckOwnership({
    idParam: 'requestId',
    resolver: resolveRequestAuthorizedUserIds,
  })
  @Delete('/:requestId')
  async deleteRequest(
    @Param('requestId', ParseIntPipe) requestId: number,
  ): Promise<void> {
    return this.requestsService.delete(requestId);
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
