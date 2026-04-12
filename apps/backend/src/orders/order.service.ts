import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Repository, In, DataSource } from 'typeorm';
import { Order } from './order.entity';
import { Pantry } from '../pantries/pantries.entity';
import { FoodManufacturer } from '../foodManufacturers/manufacturers.entity';
import { sanitizeUrl, validateId } from '../utils/validation.utils';
import { OrderStatus, VolunteerAction } from './types';
import { TrackingCostDto } from './dtos/tracking-cost.dto';
import { OrderDetailsDto } from './dtos/order-details.dto';
import { FoodRequestSummaryDto } from '../foodRequests/dtos/food-request-summary.dto';
import { ConfirmDeliveryDto } from './dtos/confirm-delivery.dto';
import { RequestsService } from '../foodRequests/request.service';
import { FoodRequestStatus } from '../foodRequests/types';
import { FoodManufacturersService } from '../foodManufacturers/manufacturers.service';
import { DonationItemsService } from '../donationItems/donationItems.service';
import { AllocationsService } from '../allocations/allocations.service';
import { DonationService } from '../donations/donations.service';
import { ApplicationStatus } from '../shared/types';
import { Donation } from '../donations/donations.entity';
import { VolunteerOrder } from '../volunteers/types';
import { EmailsService } from '../emails/email.service';
import { emailTemplates } from '../emails/emailTemplates';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private repo: Repository<Order>,
    @InjectRepository(Pantry) private pantryRepo: Repository<Pantry>,
    @InjectRepository(Donation) private donationRepo: Repository<Donation>,
    private requestsService: RequestsService,
    private manufacturerService: FoodManufacturersService,
    private donationItemsService: DonationItemsService,
    private allocationsService: AllocationsService,
    private donationService: DonationService,
    @InjectDataSource() private dataSource: DataSource,
    private emailsService: EmailsService,
  ) {}

  // TODO: when order is created, set FM

  async getAll(filters?: { status?: string; pantryNames?: string[] }) {
    const qb = this.repo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.request', 'request')
      .leftJoinAndSelect('request.pantry', 'pantry')
      .leftJoinAndSelect('order.assignee', 'assignee')
      .select([
        'order.orderId',
        'order.status',
        'order.createdAt',
        'order.shippedAt',
        'order.deliveredAt',
        'request.pantryId',
        'pantry.pantryName',
        'assignee.id',
        'assignee.firstName',
        'assignee.lastName',
      ]);

    if (filters?.status) {
      qb.andWhere('order.status = :status', { status: filters.status });
    }

    if (filters?.pantryNames) {
      qb.andWhere('pantry.pantryName IN (:...pantryNames)', {
        pantryNames: filters.pantryNames,
      });
    }

    return qb.getMany();
  }

  // returns ALL orders (not scoped to volunteer)
  // for orders assigned to the given volunteer, includes actionCompletion (otherwise undefined)
  async getAllOrdersForVolunteer(
    volunteerId: number,
  ): Promise<VolunteerOrder[]> {
    const orders = await this.repo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.request', 'request')
      .leftJoinAndSelect('request.pantry', 'pantry')
      .leftJoinAndSelect('order.assignee', 'assignee')
      .select([
        'order.orderId',
        'order.status',
        'order.createdAt',
        'order.shippedAt',
        'order.deliveredAt',
        'order.confirmDonationReceipt',
        'order.notifyPantry',
        'request.pantryId',
        'pantry.pantryName',
        'assignee.id',
        'assignee.firstName',
        'assignee.lastName',
      ])
      .getMany();

    return orders.map((o) => {
      const { assignee, confirmDonationReceipt, notifyPantry } = o;
      const actionCompletion =
        assignee.id === volunteerId
          ? { confirmDonationReceipt, notifyPantry }
          : undefined;

      return {
        orderId: o.orderId,
        status: o.status,
        createdAt: o.createdAt,
        shippedAt: o.shippedAt,
        deliveredAt: o.deliveredAt,
        pantryName: o.request.pantry.pantryName,
        assignee: o.assignee,
        actionCompletion,
      };
    });
  }

  async getCurrentOrders() {
    return this.repo.find({
      where: { status: In([OrderStatus.PENDING, OrderStatus.SHIPPED]) },
    });
  }

  async getPastOrders() {
    return this.repo.find({
      where: { status: OrderStatus.DELIVERED },
    });
  }

  /*
  This create method follows these high level steps:
  1. Validate the request status is active before allowing order creation.
  2. Ensure all donation items belong to the specified manufacturer and the manufacturer is approved.
  3. Validate allocated quantities do not exceed the remaining quantity (quantity - reserved_quantity).
  4. Create the order with status pending and assigneeId as the given userId.
  5. Associate the order with the provided request and manufacturer.
  6. Create allocation records for each donation item included in the order.
  7. Update the reserved quantity for each allocated donation item.
  8. Identify all unique donations associated with the allocated donation items and set their status to matched.
  */
  async create(
    requestId: number,
    manufacturerId: number,
    itemAllocations: Map<number, number>,
    userId: number,
  ): Promise<Order> {
    return this.dataSource.transaction(async (transactionManager) => {
      validateId(manufacturerId, 'Food Manufacturer');
      validateId(requestId, 'Request');

      const request = await this.requestsService.findOne(requestId);

      if (request.status !== FoodRequestStatus.ACTIVE) {
        throw new BadRequestException(`Request ${requestId} is not active`);
      }

      const manufacturer = await this.manufacturerService.findOne(
        manufacturerId,
      );

      if (manufacturer.status !== ApplicationStatus.APPROVED) {
        throw new BadRequestException(
          `Manufacturer ${manufacturerId} is not approved`,
        );
      }

      const fmDonations = await this.donationRepo.find({
        where: { foodManufacturer: { foodManufacturerId: manufacturerId } },
        select: ['donationId'],
      });

      const fmDonationIdSet = new Set(fmDonations.map((d) => d.donationId));

      const donationItemIds = Array.from(itemAllocations.keys());
      const donationItems = await this.donationItemsService.getByIds(
        donationItemIds,
      );

      const invalidItems = donationItems.filter(
        (item) => !fmDonationIdSet.has(item.donationId),
      );

      if (invalidItems.length > 0) {
        const messages = invalidItems.map(
          (item) =>
            `Donation item ID ${item.itemId} with Donation ID ${item.donationId}`,
        );
        throw new BadRequestException(
          `The following donation items are not associated with the current food manufacturer: ${messages.join(
            ', ',
          )}`,
        );
      }

      for (const donationItem of donationItems) {
        const id = donationItem.itemId;
        const quantityToAllocate = itemAllocations.get(id)!;

        if (
          quantityToAllocate >
          donationItem.quantity - donationItem.reservedQuantity
        ) {
          throw new BadRequestException(
            `Donation item ${id} quantity to allocate exceeds remaining quantity`,
          );
        }
      }

      const orderTransactionRepo = transactionManager.getRepository(Order);

      const order = orderTransactionRepo.create({
        requestId: requestId,
        foodManufacturerId: manufacturerId,
        status: OrderStatus.PENDING,
        assigneeId: userId,
      });

      const savedOrder = await orderTransactionRepo.save(order);

      await this.allocationsService.createMultiple(
        savedOrder.orderId,
        itemAllocations,
        transactionManager,
      );

      const associatedDonationIdsSet =
        await this.donationItemsService.getAssociatedDonationIds(
          donationItemIds,
        );

      await this.donationService.matchAll(
        Array.from(associatedDonationIdsSet),
        transactionManager,
      );

      return savedOrder;
    });
  }

  async findOne(orderId: number): Promise<Order> {
    validateId(orderId, 'Order');

    const order = await this.repo.findOneBy({ orderId });

    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }
    return order;
  }

  async findOrderDetails(orderId: number): Promise<OrderDetailsDto> {
    validateId(orderId, 'Order');

    const order = await this.repo.findOne({
      where: { orderId },
      relations: {
        allocations: {
          item: true,
        },
        foodManufacturer: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }

    return {
      orderId: order.orderId,
      status: order.status,
      foodManufacturerName: order.foodManufacturer.foodManufacturerName,
      trackingLink: order.trackingLink,
      items: order.allocations.map((allocation) => ({
        id: allocation.item.itemId,
        name: allocation.item.itemName,
        quantity: allocation.allocatedQuantity,
        foodType: allocation.item.foodType,
      })),
    };
  }

  async findOrderByRequest(requestId: number): Promise<Order> {
    validateId(requestId, 'Request');

    const order = await this.repo.findOne({
      where: { requestId },
      relations: ['request'],
    });

    if (!order) {
      throw new NotFoundException(
        `Order with request ID ${requestId} not found`,
      );
    }
    return order;
  }

  async findOrderPantry(orderId: number): Promise<Pantry> {
    const request = await this.findOrderFoodRequest(orderId);
    if (!request) {
      throw new NotFoundException(`Request for order ${orderId} not found`);
    }

    const pantry = await this.pantryRepo.findOneBy({
      pantryId: request.pantryId,
    });

    if (!pantry) {
      throw new NotFoundException(`Pantry ${request.pantryId} not found`);
    }

    return pantry;
  }

  async findOrderFoodRequest(orderId: number): Promise<FoodRequestSummaryDto> {
    validateId(orderId, 'Order');

    const order = await this.repo.findOne({
      where: { orderId },
      relations: {
        request: {
          pantry: true,
        },
      },
      select: {
        request: {
          requestId: true,
          pantryId: true,
          requestedSize: true,
          requestedFoodTypes: true,
          additionalInformation: true,
          requestedAt: true,
          status: true,
          pantry: {
            pantryName: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }

    return {
      requestId: order.request.requestId,
      pantryId: order.request.pantryId,
      pantryName: order.request.pantry.pantryName,

      requestedSize: order.request.requestedSize,
      requestedFoodTypes: order.request.requestedFoodTypes,

      additionalInformation: order.request.additionalInformation ?? null,

      requestedAt: order.request.requestedAt,

      status: order.request.status,
    };
  }

  async findOrderFoodManufacturer(orderId: number): Promise<FoodManufacturer> {
    validateId(orderId, 'Order');

    const order = await this.repo.findOne({
      where: { orderId },
      relations: ['foodManufacturer'],
    });

    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }
    return order.foodManufacturer;
  }

  async updateStatus(orderId: number, newStatus: OrderStatus) {
    validateId(orderId, 'Order');

    await this.repo
      .createQueryBuilder()
      .update(Order)
      .set({
        status: newStatus as OrderStatus,
        shippedAt: newStatus === OrderStatus.SHIPPED ? new Date() : undefined,
        deliveredAt:
          newStatus === OrderStatus.DELIVERED ? new Date() : undefined,
      })
      .where('order_id = :orderId', { orderId })
      .execute();
  }

  // Updated confirmDelivery()
  async confirmDelivery(
    orderId: number,
    dto: ConfirmDeliveryDto,
    photos: string[],
  ): Promise<Order> {
    validateId(orderId, 'Order');

    const formattedDate = new Date(dto.dateReceived);
    if (isNaN(formattedDate.getTime())) {
      throw new BadRequestException('Invalid date format for dateReceived');
    }

    const order = await this.repo.findOne({
      where: { orderId },
      relations: ['request', 'request.pantry', 'foodManufacturer', 'assignee'],
    });

    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }

    if (order.status !== OrderStatus.SHIPPED) {
      throw new BadRequestException(
        'Can only confirm delivery for shipped orders',
      );
    }

    order.dateReceived = formattedDate;
    order.feedback = dto.feedback ?? null;
    order.photos = photos;
    order.status = OrderStatus.DELIVERED;

    const updatedOrder = await this.repo.save(order);

    await this.requestsService.updateRequestStatus(order.requestId);

    const { subject, bodyHTML } = emailTemplates.pantryConfirmsOrderDelivery({
      volunteerName: `${order.assignee.firstName} ${order.assignee.lastName}`,
      pantryName: order.request.pantry.pantryName,
      fmName: order.foodManufacturer.foodManufacturerName,
    });

    await this.emailsService.sendEmails(
      [order.assignee.email],
      subject,
      bodyHTML,
    );

    return updatedOrder;
  }

  async getOrdersByPantry(
    pantryId: number,
    years?: number[],
  ): Promise<Order[]> {
    validateId(pantryId, 'Pantry');

    const pantry = await this.pantryRepo.findOneBy({ pantryId });
    if (!pantry) {
      throw new NotFoundException(`Pantry ${pantryId} not found`);
    }

    const qb = this.repo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.request', 'request')
      .leftJoinAndSelect('order.allocations', 'allocations')
      .leftJoinAndSelect('allocations.item', 'item')
      .where('request.pantryId = :pantryId', { pantryId });

    if (years && years.length > 0) {
      qb.andWhere('EXTRACT(YEAR FROM order.createdAt) IN (:...years)', {
        years,
      });
    }

    return qb.getMany();
  }

  async updateTrackingCostInfo(orderId: number, dto: TrackingCostDto) {
    validateId(orderId, 'Order');
    if (!dto.trackingLink && !dto.shippingCost) {
      throw new BadRequestException(
        'At least one of tracking link or shipping cost must be provided',
      );
    }

    if (dto.trackingLink) {
      const sanitized = sanitizeUrl(dto.trackingLink);
      if (!sanitized) {
        throw new BadRequestException(
          'Invalid tracking link. Only valid HTTP/HTTPS URLs are accepted.',
        );
      }
      dto.trackingLink = sanitized;
    }

    const order = await this.repo.findOne({
      where: { orderId },
      relations: ['request', 'request.pantry', 'foodManufacturer', 'assignee'],
    });
    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }

    const isFirstTimeSetting = !order.trackingLink && !order.shippingCost;

    if (isFirstTimeSetting && (!dto.trackingLink || !dto.shippingCost)) {
      throw new BadRequestException(
        'Must provide both tracking link and shipping cost on initial assignment',
      );
    }

    if (
      order.status !== OrderStatus.SHIPPED &&
      order.status !== OrderStatus.PENDING
    ) {
      throw new BadRequestException(
        'Can only update tracking info for pending or shipped orders',
      );
    }

    if (dto.trackingLink) order.trackingLink = dto.trackingLink;
    if (dto.shippingCost) order.shippingCost = dto.shippingCost;

    if (
      order.status === OrderStatus.PENDING &&
      order.trackingLink &&
      order.shippingCost
    ) {
      order.status = OrderStatus.SHIPPED;
      order.shippedAt = new Date();

      const { subject, bodyHTML } = emailTemplates.trackingLinkAvailable({
        pantryName: order.request.pantry.pantryName,
        fmName: order.foodManufacturer.foodManufacturerName,
        trackingLink: order.trackingLink,
        volunteerName: `${order.assignee.firstName} ${order.assignee.lastName}`,
        volunteerEmail: order.assignee.email,
      });

      const pantryEmails = [order.request.pantry.secondaryContactEmail].filter(
        (e): e is string => e !== null,
      );

      if (pantryEmails.length > 0) {
        await this.emailsService.sendEmails(pantryEmails, subject, bodyHTML);
      }
    }

    await this.repo.save(order);
  }

  async completeVolunteerAction(orderId: number, action: VolunteerAction) {
    validateId(orderId, 'Order');

    const order = await this.repo.findOneBy({ orderId });

    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }

    if (order[action]) {
      throw new BadRequestException(
        `Action ${action} already completed for Order ${orderId}`,
      );
    }

    if (order.status !== OrderStatus.SHIPPED) {
      throw new BadRequestException(
        `Action ${action} can only be completed for shipped orders`,
      );
    }

    order[action] = true;

    return this.repo.save(order);
  }
}
