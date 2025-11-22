import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Order } from './order.entity';
import { Pantry } from '../pantries/pantries.entity';
import { FoodManufacturer } from '../foodManufacturers/manufacturer.entity';
import { FoodRequest } from '../foodRequests/request.entity';
import { Donation } from '../donations/donations.entity';
import { validateId } from '../utils/validation.utils';
import { OrderStatus } from './types';

@Injectable()
export class OrdersService {
  constructor(@InjectRepository(Order) private repo: Repository<Order>) {}

  async getAll(filters?: { status?: string; pantryNames?: string[] }) {
    const qb = this.repo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.pantry', 'pantry')
      .select([
        'order.orderId',
        'order.status',
        'order.createdAt',
        'order.shippedAt',
        'order.deliveredAt',
        'pantry.pantryName',
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
    validateId(orderId, 'Order');

    const order = await this.repo.findOne({
      where: { orderId },
      relations: ['pantry'],
    });

    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }
    return order.pantry;
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

    const order = await this.findOne(orderId);

    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }
    return order.foodManufacturer;
  }

  async findOrderDonation(orderId: number): Promise<Donation> {
    validateId(orderId, 'Order');

    const order = await this.repo.findOne({
      where: { orderId },
      relations: ['donation'],
    });

    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }
    return order.donation;
  }

  async updateStatus(orderId: number, newStatus: OrderStatus) {
    validateId(orderId, 'Order');

    // TODO: Once we start navigating to proper food manufacturer page, change the 1 to be the proper food manufacturer id
    await this.repo
      .createQueryBuilder()
      .update(Order)
      .set({
        status: newStatus as OrderStatus,
        shippedBy: 1,
        shippedAt: newStatus === OrderStatus.SHIPPED ? new Date() : null,
        deliveredAt: newStatus === OrderStatus.DELIVERED ? new Date() : null,
      })
      .where('order_id = :orderId', { orderId })
      .execute();
  }
}
