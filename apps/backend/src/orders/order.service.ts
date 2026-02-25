import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Order } from './order.entity';
import { Pantry } from '../pantries/pantries.entity';
import { FoodManufacturer } from '../foodManufacturers/manufacturers.entity';
import { FoodRequest } from '../foodRequests/request.entity';
import { FoodRequestStatus } from '../foodRequests/types';
import { validateId } from '../utils/validation.utils';
import { OrderStatus } from './types';
import { TrackingCostDto } from './dtos/tracking-cost.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private repo: Repository<Order>,
    @InjectRepository(Pantry) private pantryRepo: Repository<Pantry>,
    @InjectRepository(FoodRequest)
    private requestRepo: Repository<FoodRequest>,
  ) {}

  // TODO: when order is created, set FM

  async getAll(filters?: { status?: string; pantryNames?: string[] }) {
    const qb = this.repo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.request', 'request')
      .leftJoinAndSelect('request.pantry', 'pantry')
      .leftJoinAndSelect('pantry.volunteers', 'volunteers')
      .select([
        'order.orderId',
        'order.status',
        'order.createdAt',
        'order.shippedAt',
        'order.deliveredAt',
        'request.pantryId',
        'pantry.pantryName',
        'volunteers.id',
        'volunteers.firstName',
        'volunteers.lastName',
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

  async findOne(orderId: number): Promise<Order> {
    validateId(orderId, 'Order');

    const order = await this.repo.findOneBy({ orderId });

    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }
    return order;
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

    return pantry;
  }

  async findOrderFoodRequest(orderId: number): Promise<FoodRequest> {
    validateId(orderId, 'Order');

    const order = await this.repo.findOne({
      where: { orderId },
      relations: ['request'],
    });

    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }
    return order.request;
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

  async confirmDelivery(
    orderId: number,
    dateReceived: Date,
    photos: string[],
    feedback?: string,
  ): Promise<Order> {
    validateId(orderId, 'Order');

    const order = await this.repo.findOne({
      where: { orderId },
    });

    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }

    order.dateReceived = dateReceived;
    order.feedback = feedback;
    order.photos = photos;
    order.status = OrderStatus.DELIVERED;

    const updatedOrder = await this.repo.save(order);

    await this.updateRequestStatus(order.requestId);

    return updatedOrder;
  }

  private async updateRequestStatus(requestId: number): Promise<void> {
    validateId(requestId, 'Request');

    const request = await this.requestRepo.findOne({
      where: { requestId },
      relations: ['orders'],
    });

    if (!request) {
      throw new NotFoundException(`Request ${requestId} not found`);
    }

    const orders = request.orders || [];
    if (!orders.length) {
      throw new NotFoundException(`No orders found for request ${requestId}`);
    }

    const allDelivered = orders.every(
      (order) => order.status === OrderStatus.DELIVERED,
    );

    request.status = allDelivered
      ? FoodRequestStatus.CLOSED
      : FoodRequestStatus.ACTIVE;

    await this.requestRepo.save(request);
  }

  async getOrdersByPantry(pantryId: number): Promise<Order[]> {
    validateId(pantryId, 'Pantry');

    const pantry = await this.pantryRepo.findOneBy({ pantryId });
    if (!pantry) {
      throw new NotFoundException(`Pantry ${pantryId} not found`);
    }

    const orders = await this.repo.find({
      where: { request: { pantryId } },
      relations: ['request'],
    });

    return orders;
  }

  async updateTrackingCostInfo(orderId: number, dto: TrackingCostDto) {
    validateId(orderId, 'Order');
    if (!dto.trackingLink && !dto.shippingCost) {
      throw new BadRequestException(
        'At least one of tracking link or shipping cost must be provided',
      );
    }

    const order = await this.repo.findOneBy({ orderId });
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
    }

    await this.repo.save(order);
  }
}
