import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order } from './order.entity';
import { Pantry } from '../pantries/pantries.entity';
import { validateId } from '../utils/validation.utils';
import { DonationService } from '../donations/donations.service';
import { OrderStatus, VolunteerAction } from './types';
import { BulkUpdateTrackingCostDto } from './dtos/bulk-update-tracking-cost.dto';
import { OrderDetailsDto } from './dtos/order-details.dto';
import { FoodRequestSummaryDto } from '../foodRequests/dtos/food-request-summary.dto';
import { ConfirmDeliveryDto } from './dtos/confirm-delivery.dto';
import { RequestsService } from '../foodRequests/request.service';
import { Donation } from '../donations/donations.entity';
import { DonationItem } from '../donationItems/donationItems.entity';
import { FoodRequestStatus } from '../foodRequests/types';
import { FoodManufacturersService } from '../foodManufacturers/manufacturers.service';
import { DonationItemsService } from '../donationItems/donationItems.service';
import { AllocationsService } from '../allocations/allocations.service';
import { ApplicationStatus } from '../shared/types';
import { VolunteerOrder } from '../volunteers/types';
import { EmailsService } from '../emails/email.service';
import { FoodRequest } from '../foodRequests/request.entity';
import { emailTemplates } from '../emails/emailTemplates';
import { UsersService } from '../users/users.service';
import { OrderSummary } from '../pantries/types';
import { PantriesService } from '../pantries/pantries.service';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectRepository(Order) private repo: Repository<Order>,
    @InjectRepository(Pantry) private pantryRepo: Repository<Pantry>,
    @InjectRepository(Donation) private donationRepo: Repository<Donation>,
    @InjectRepository(FoodRequest) private requestRepo: Repository<FoodRequest>,
    private requestsService: RequestsService,
    private usersService: UsersService,
    private manufacturerService: FoodManufacturersService,
    private donationItemsService: DonationItemsService,
    private allocationsService: AllocationsService,
    private pantriesService: PantriesService,
    private donationService: DonationService,
    @InjectDataSource() private dataSource: DataSource,
    private emailsService: EmailsService,
  ) {}

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
        pantryId: o.request.pantryId,
        pantryName: o.request.pantry.pantryName,
        assignee: o.assignee,
        actionCompletion,
      };
    });
  }

  async getRecentOrdersByAssignee(
    volunteerId: number,
  ): Promise<VolunteerOrder[]> {
    validateId(volunteerId, 'Volunteer');

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
        'request.pantryId',
        'pantry.pantryName',
        'assignee.id',
        'assignee.firstName',
        'assignee.lastName',
      ])
      .where('order.assigneeId = :volunteerId', { volunteerId })
      .orderBy('order.createdAt', 'DESC')
      .take(2)
      .getMany();

    return orders.map((o) => ({
      orderId: o.orderId,
      status: o.status,
      createdAt: o.createdAt,
      shippedAt: o.shippedAt,
      deliveredAt: o.deliveredAt,
      pantryId: o.request.pantryId,
      pantryName: o.request.pantry.pantryName,
      assignee: o.assignee,
    }));
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
    const { savedOrder, request, manufacturer, assignee, itemDetails } =
      await this.dataSource.transaction(async (transactionManager) => {
        validateId(manufacturerId, 'Food Manufacturer');
        validateId(requestId, 'Request');
        validateId(userId, 'User');

        const request = await this.requestRepo.findOne({
          where: { requestId },
          relations: ['pantry', 'pantry.pantryUser'],
        });

        if (!request) {
          throw new NotFoundException(`Request ${requestId} not found`);
        }

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

        const pantry = await this.pantriesService.findOne(request.pantryId);

        if (pantry.status !== ApplicationStatus.APPROVED) {
          throw new BadRequestException(
            `Pantry ${request.pantryId} is not approved`,
          );
        }

        const fmDonations = await this.donationRepo.find({
          where: { foodManufacturer: { foodManufacturerId: manufacturerId } },
          select: ['donationId'],
        });

        if (fmDonations.length === 0) {
          throw new BadRequestException(
            `Manufacturer ${manufacturerId} has no donations`,
          );
        }

        const fmDonationIdSet = new Set(fmDonations.map((d) => d.donationId));

        const donationItemIds = Array.from(itemAllocations.keys());
        const donationItems = await this.donationItemsService.getByIds(
          donationItemIds,
        );

        if (donationItems.length === 0) {
          throw new BadRequestException(
            'Cannot create order with no donation items',
          );
        }

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

        const itemDetails: { quantity: string; product: string }[] = [];

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

          itemDetails.push({
            quantity: String(quantityToAllocate),
            product: donationItem.itemName,
          });
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

        await this.donationService.matchAll(
          [...new Set(donationItems.map((item) => item.donationId))],
          transactionManager,
        );

        const assignee = await this.usersService.findOne(userId);

        return {
          savedOrder,
          request,
          manufacturer,
          assignee,
          itemDetails,
        };
      });

    const emailErrors: string[] = [];

    try {
      const pantryMessage = emailTemplates.pantryRequestMatchedOrder({
        pantryName: request.pantry.pantryName,
        items: itemDetails,
        brand: manufacturer.foodManufacturerName,
        volunteerName: `${assignee.firstName} ${assignee.lastName}`,
        volunteerEmail: assignee.email,
      });
      await this.emailsService.sendEmails({
        toEmail: request.pantry.pantryUser.email,
        subject: pantryMessage.subject,
        bodyHtml: pantryMessage.bodyHTML,
      });
    } catch {
      emailErrors.push(
        'Failed to send pantry request matched order confirmation email',
      );
    }

    try {
      const pantryAddress = `${request.pantry.shipmentAddressLine1}${
        request.pantry.shipmentAddressLine2
          ? `<br />${request.pantry.shipmentAddressLine2}`
          : ''
      }<br />
${request.pantry.shipmentAddressCity}, ${request.pantry.shipmentAddressState} ${
        request.pantry.shipmentAddressZip
      }${
        request.pantry.shipmentAddressCountry
          ? `<br />${request.pantry.shipmentAddressCountry}`
          : ''
      }`;

      const fmMessage = emailTemplates.fmDonationMatchedOrder({
        manufacturerName: manufacturer.foodManufacturerName,
        items: itemDetails,
        pantryName: request.pantry.pantryName,
        pantryAddress: pantryAddress,
        volunteerName: `${assignee.firstName} ${assignee.lastName}`,
        volunteerEmail: assignee.email,
      });
      await this.emailsService.sendEmails({
        toEmail: manufacturer.foodManufacturerRepresentative.email,
        subject: fmMessage.subject,
        bodyHtml: fmMessage.bodyHTML,
      });
    } catch {
      emailErrors.push(
        'Failed to send food manufacturer donation matched order confirmation email',
      );
    }

    if (emailErrors.length > 0) {
      throw new InternalServerErrorException(emailErrors.join('; '));
    }

    return savedOrder;
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
      shippingCost: order.shippingCost,
      items: order.allocations.map((allocation) => ({
        id: allocation.item.itemId,
        name: allocation.item.itemName,
        quantity: allocation.allocatedQuantity,
        foodType: allocation.item.foodType,
      })),
    };
  }

  async findOrderPantry(orderId: number): Promise<Pantry> {
    const request = await this.findOrderFoodRequest(orderId);
    if (!request) {
      throw new NotFoundException(`Request for order ${orderId} not found`);
    }

    const pantry = await this.pantryRepo.findOneBy({
      pantryId: request.pantry.pantryId,
    });

    if (!pantry) {
      throw new NotFoundException(
        `Pantry ${request.pantry.pantryId} not found`,
      );
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
          requestedSize: true,
          requestedFoodTypes: true,
          additionalInformation: true,
          requestedAt: true,
          status: true,
          pantry: {
            pantryId: true,
            pantryName: true,
            status: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }

    return {
      requestId: order.request.requestId,
      requestedSize: order.request.requestedSize,
      requestedFoodTypes: order.request.requestedFoodTypes,
      additionalInformation: order.request.additionalInformation ?? null,
      requestedAt: order.request.requestedAt,
      status: order.request.status,
      pantry: {
        pantryId: order.request.pantry.pantryId,
        pantryName: order.request.pantry.pantryName,
      },
    };
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

  async confirmDelivery(
    orderId: number,
    dto: ConfirmDeliveryDto,
    photos: string[],
  ): Promise<void> {
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

    await this.repo.save(order);
    await this.requestsService.updateRequestStatus(order.requestId);

    try {
      const message = emailTemplates.pantryConfirmsOrderDelivery({
        volunteerName: `${order.assignee.firstName} ${order.assignee.lastName}`,
        pantryName: order.request.pantry.pantryName,
        fmName: order.foodManufacturer.foodManufacturerName,
      });

      await this.emailsService.sendEmails({
        toEmail: order.assignee.email,
        subject: message.subject,
        bodyHtml: message.bodyHTML,
      });
    } catch {
      throw new InternalServerErrorException(
        'Failed to send order delivery confirmation email to volunteer',
      );
    }
  }

  async getOrdersByPantry(pantryId: number): Promise<OrderSummary[]> {
    validateId(pantryId, 'Pantry');

    const pantry = await this.pantryRepo.findOneBy({ pantryId });
    if (!pantry) {
      throw new NotFoundException(`Pantry ${pantryId} not found`);
    }

    const qb = this.repo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.request', 'request')
      .leftJoin('request.pantry', 'pantry')
      .addSelect('pantry.pantryName')
      .leftJoinAndSelect('order.assignee', 'assignee')
      .where('request.pantryId = :pantryId', { pantryId });

    const orders = await qb.getMany();

    return orders.map((order) => ({
      orderId: order.orderId,
      status: order.status,
      createdAt: order.createdAt.toISOString(),
      shippedAt: order.shippedAt?.toISOString() ?? null,
      deliveredAt: order.deliveredAt?.toISOString() ?? null,
      request: {
        pantryId: order.request.pantryId,
        pantry: {
          pantryName: order.request.pantry.pantryName,
          volunteers:
            order.request.pantry.volunteers?.map((v) => ({
              id: v.id,
              firstName: v.firstName,
              lastName: v.lastName,
            })) ?? null,
        },
      },
      assignee: {
        id: order.assignee.id,
        firstName: order.assignee.firstName,
        lastName: order.assignee.lastName,
      },
    }));
  }

  async bulkUpdateTrackingCostInfo(
    dto: BulkUpdateTrackingCostDto,
  ): Promise<void> {
    if (dto.orders.length === 0) {
      return;
    }

    const orders = new Set(dto.orders.map((o) => o.orderId));
    if (orders.size !== dto.orders.length) {
      throw new BadRequestException(
        'Cannot update duplicate entries for orders',
      );
    }

    for (const order of dto.orders) {
      validateId(order.orderId, 'Order');

      if (
        order.trackingLink === undefined &&
        order.shippingCost === undefined
      ) {
        throw new BadRequestException(
          `Order ${order.orderId} must include at least a tracking link or shipping cost.`,
        );
      }
    }

    const ordersGainedTrackingLink: Order[] = [];

    await this.dataSource.transaction(async (transactionManager) => {
      const orderTransactionRepo = transactionManager.getRepository(Order);
      const donationTransactionRepo =
        transactionManager.getRepository(Donation);

      const donation = await donationTransactionRepo.findOneBy({
        donationId: dto.donationId,
      });
      if (!donation) {
        throw new NotFoundException(`Donation ${dto.donationId} not found`);
      }

      const ordersToUpdate: Order[] = [];

      for (const entry of dto.orders) {
        const order = await orderTransactionRepo.findOne({
          where: { orderId: entry.orderId },
          relations: [
            'request',
            'request.pantry',
            'request.pantry.pantryUser',
            'foodManufacturer',
            'assignee',
          ],
        });
        if (!order) {
          throw new NotFoundException(`Order ${entry.orderId} not found`);
        }

        if (order.status !== OrderStatus.PENDING) {
          throw new BadRequestException(
            `Can only update tracking info for pending orders. Order ${entry.orderId} is ${order.status}`,
          );
        }

        // Can only update orders belonging to the provided donation
        const relatedCount = await transactionManager
          .createQueryBuilder(DonationItem, 'item')
          .innerJoin('item.allocations', 'allocation')
          .where('allocation.orderId = :orderId', { orderId: entry.orderId })
          .andWhere('item.donationId = :donationId', {
            donationId: dto.donationId,
          })
          .getCount();

        if (relatedCount === 0) {
          throw new BadRequestException(
            `Order ${entry.orderId} does not belong to donation ${dto.donationId}`,
          );
        }

        // Check to see if tracking link existed in the first place
        const hadTrackingLink = !!order.trackingLink;

        if (entry.trackingLink !== undefined) {
          order.trackingLink = entry.trackingLink;
        }
        if (entry.shippingCost !== undefined) {
          order.shippingCost = entry.shippingCost;
        }
        if (order.trackingLink !== null && order.shippingCost !== null) {
          order.status = OrderStatus.SHIPPED;
          order.shippedAt = new Date();
        }

        // If tracking link didn't exist previous, but does now, add it to the list to send an email
        if (!hadTrackingLink && !!order.trackingLink) {
          ordersGainedTrackingLink.push(order);
        }

        ordersToUpdate.push(order);
      }

      await orderTransactionRepo.save(ordersToUpdate);
      await this.donationService.checkAndFulfillDonation(
        donation,
        transactionManager,
      );
    });

    for (const order of ordersGainedTrackingLink) {
      try {
        const message = emailTemplates.trackingLinkAvailable({
          pantryName: order.request.pantry.pantryName,
          fmName: order.foodManufacturer.foodManufacturerName,
          trackingLink: order.trackingLink!,
          volunteerName: `${order.assignee.firstName} ${order.assignee.lastName}`,
          volunteerEmail: order.assignee.email,
        });

        await this.emailsService.sendEmails({
          toEmail: order.request.pantry.pantryUser.email,
          subject: message.subject,
          bodyHtml: message.bodyHTML,
        });
      } catch {
        this.logger.warn(
          `Automated tracking link email failed to send for order ${order.orderId}`,
        );
      }
    }
  }

  async completeVolunteerAction(
    orderId: number,
    action: VolunteerAction,
  ): Promise<void> {
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

    await this.repo.save(order);
  }
}
