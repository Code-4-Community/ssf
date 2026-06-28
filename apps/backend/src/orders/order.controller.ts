import {
  Controller,
  Get,
  Patch,
  Param,
  ParseIntPipe,
  Body,
  Query,
  BadRequestException,
  ValidationPipe,
  UploadedFiles,
  UseInterceptors,
  Post,
  PayloadTooLargeException,
  Req,
} from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { OrdersService } from './order.service';
import { Order } from './order.entity';
import { Pantry } from '../pantries/pantries.entity';
import { AllocationsService } from '../allocations/allocations.service';
import { OrderStatus } from './types';
import {
  CheckOwnership,
  OwnerIdResolver,
  pipeNullable,
} from '../auth/ownership.decorator';
import { PantriesService } from '../pantries/pantries.service';
import { RequestsService } from '../foodRequests/request.service';
import { FoodRequest } from '../foodRequests/request.entity';
import { DonationService } from '../donations/donations.service';
import { Donation } from '../donations/donations.entity';
import { BulkUpdateTrackingCostDto } from './dtos/bulk-update-tracking-cost.dto';
import { OrderDetailsDto } from './dtos/order-details.dto';
import { FoodRequestSummaryDto } from '../foodRequests/dtos/food-request-summary.dto';
import { AWSS3Service } from '../aws/aws-s3.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';
import { ConfirmDeliveryDto } from './dtos/confirm-delivery.dto';
import { CompleteVolunteerActionDto } from './dtos/complete-volunteer-action.dto';
import { CreateOrderDto } from './dtos/create-order.dto';
import { UpdateAllocationsDto } from './dtos/update-allocations.dto';
import { AuthenticatedRequest } from '../auth/authenticated-request';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../users/types';

const resolveOrderAuthorizedUserIds: OwnerIdResolver = ({
  entityId,
  services,
  user,
}) => {
  if (user?.role === Role.VOLUNTEER) {
    return pipeNullable(
      () => services.get(OrdersService).findOne(entityId),
      (order: Order) => [order.assigneeId],
    );
  }
  return pipeNullable(
    () => services.get(OrdersService).findOrderFoodRequest(entityId),
    (request: FoodRequestSummaryDto) =>
      services.get(PantriesService).findOne(request.pantry.pantryId),
    (pantry: Pantry) => [pantry.pantryUser.id],
  );
};

const resolveCreateOrderAuthorizedUserIds: OwnerIdResolver = ({
  entityId,
  services,
}) =>
  pipeNullable(
    () => services.get(RequestsService).findOne(entityId),
    (request: FoodRequest) =>
      services.get(PantriesService).findOne(request.pantryId),
    (pantry: Pantry) => (pantry.volunteers ?? []).map((v) => v.id),
  );

const resolveDonationAuthorizedUserIds: OwnerIdResolver = ({
  entityId,
  services,
}) =>
  pipeNullable(
    () => services.get(DonationService).findOne(entityId),
    (donation: Donation) => [
      donation.foodManufacturer.foodManufacturerRepresentative.id,
    ],
  );

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly awsS3Service: AWSS3Service,
  ) {}

  // Called like: /?status=pending&pantryName=Test%20Pantry&pantryName=Test%20Pantry%202
  // %20 is the URL encoded space character
  // This gets all orders where the status is pending and the pantry name is either Test Pantry or Test Pantry 2
  @Roles(Role.ADMIN)
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

  @CheckOwnership({
    idParam: 'orderId',
    resolver: resolveOrderAuthorizedUserIds,
    bypassRoles: [Role.VOLUNTEER],
  })
  @Roles(Role.VOLUNTEER, Role.PANTRY, Role.ADMIN)
  @Get('/:orderId/request')
  async getRequestFromOrder(
    @Param('orderId', ParseIntPipe) orderId: number,
  ): Promise<FoodRequestSummaryDto> {
    return this.ordersService.findOrderFoodRequest(orderId);
  }

  @CheckOwnership({
    idParam: 'orderId',
    resolver: resolveOrderAuthorizedUserIds,
    bypassRoles: [Role.VOLUNTEER],
  })
  @Roles(Role.VOLUNTEER, Role.PANTRY, Role.ADMIN)
  @Get('/:orderId')
  async getOrder(
    @Param('orderId', ParseIntPipe) orderId: number,
  ): Promise<OrderDetailsDto> {
    return this.ordersService.findOrderDetails(orderId);
  }

  @Roles(Role.ADMIN, Role.VOLUNTEER)
  @CheckOwnership({
    idParam: 'foodRequestId',
    idSource: 'body',
    resolver: resolveCreateOrderAuthorizedUserIds,
  })
  @Post('/')
  @ApiBody({
    description: 'Details for creating a order',
    schema: {
      type: 'object',
      properties: {
        foodRequestId: {
          type: 'integer',
          description: 'ID of the associated request this order is related to',
          example: 1,
        },
        manufacturerId: {
          type: 'integer',
          description: 'Food manufacturer ID of the FM fulfilling the order',
          example: 1,
        },
        itemAllocations: {
          type: 'object',
          description:
            'Map of donationItemId -> quantity to allocate, donation items and their quantity to allocate for this order',
          additionalProperties: {
            type: 'integer',
            example: 10,
          },
          example: {
            '5': 10,
            '8': 3,
            '12': 7,
          },
        },
      },
    },
  })
  async createOrder(
    @Req() req: AuthenticatedRequest,
    @Body(new ValidationPipe())
    orderData: CreateOrderDto,
  ): Promise<Order> {
    const parsedAllocations = new Map<number, number>();

    for (const [key, value] of Object.entries(orderData.itemAllocations)) {
      const itemId = Number(key);

      if (!Number.isInteger(itemId) || itemId < 1) {
        throw new BadRequestException(`Invalid item ID: ${key}`);
      }

      if (typeof value !== 'number') {
        throw new BadRequestException(
          `Quantity for item ${key} must be of type number`,
        );
      }

      if (!Number.isInteger(value) || value < 1) {
        throw new BadRequestException(`Invalid quantity for item ${key}`);
      }

      if (parsedAllocations.has(itemId)) {
        throw new BadRequestException(
          `Invalid duplicate item IDs for item: ${itemId}`,
        );
      }

      parsedAllocations.set(itemId, value);
    }

    return this.ordersService.create(
      orderData.foodRequestId,
      orderData.manufacturerId,
      parsedAllocations,
      req.user.id,
    );
  }

  @Roles(Role.FOODMANUFACTURER)
  @CheckOwnership({
    idParam: 'donationId',
    idSource: 'body',
    resolver: resolveDonationAuthorizedUserIds,
  })
  @Patch('/bulk-update-tracking-cost-info')
  async bulkUpdateTrackingCostInfo(
    @Body(new ValidationPipe()) dto: BulkUpdateTrackingCostDto,
  ): Promise<void> {
    return this.ordersService.bulkUpdateTrackingCostInfo(dto);
  }

  @CheckOwnership({
    idParam: 'orderId',
    resolver: resolveOrderAuthorizedUserIds,
  })
  @Roles(Role.PANTRY)
  @Patch('/:orderId/confirm-delivery')
  @ApiBody({
    description: 'Details for a confirmation of order delivery form',
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
          example: [
            'https://s3.amazonaws.com/bucket/photo1.jpg',
            'https://s3.amazonaws.com/bucket/photo2.jpg',
          ],
        },
      },
    },
  })
  @UseInterceptors(
    FilesInterceptor('photos', 10, {
      storage: multer.memoryStorage(),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5 MB in bytes
      },
    }),
  )
  async confirmDelivery(
    @Param('orderId', ParseIntPipe) orderId: number,
    @Body() body: ConfirmDeliveryDto,
    @UploadedFiles() photos?: Express.Multer.File[],
  ): Promise<void> {
    try {
      const uploadedPhotoUrls =
        photos && photos.length > 0
          ? await this.awsS3Service.upload(photos)
          : [];
      await this.ordersService.confirmDelivery(
        orderId,
        body,
        uploadedPhotoUrls,
      );
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'code' in err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          throw new PayloadTooLargeException(
            'Each photo must be 5 MB or smaller',
          );
        }
      }
      throw err;
    }
  }

  @CheckOwnership({
    idParam: 'orderId',
    resolver: resolveOrderAuthorizedUserIds,
  })
  @Roles(Role.VOLUNTEER)
  @Patch('/:orderId/complete-action')
  async completeVolunteerAction(
    @Param('orderId', ParseIntPipe) orderId: number,
    @Body(new ValidationPipe()) dto: CompleteVolunteerActionDto,
  ): Promise<void> {
    await this.ordersService.completeVolunteerAction(orderId, dto.action);
  }

  @CheckOwnership({
    idParam: 'orderId',
    resolver: resolveOrderAuthorizedUserIds,
  })
  @Roles(Role.VOLUNTEER)
  @Patch('/:orderId/close')
  async closeOrder(
    @Param('orderId', ParseIntPipe) orderId: number,
  ): Promise<void> {
    await this.ordersService.closeOrder(orderId);
  }

  @CheckOwnership({
    idParam: 'orderId',
    resolver: resolveOrderAuthorizedUserIds,
  })
  @Roles(Role.VOLUNTEER)
  @Patch('/:orderId/allocations')
  async editAllocations(
    @Param('orderId', ParseIntPipe) orderId: number,
    @Body(new ValidationPipe()) dto: UpdateAllocationsDto,
  ): Promise<void> {
    await this.ordersService.updateAllocations(orderId, dto);
  }
}
