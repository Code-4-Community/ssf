import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Order } from './order.entity';
import { Pantry } from '../pantries/pantries.entity';
import { FoodManufacturer } from '../foodManufacturers/manufacturer.entity';
import { FoodRequest } from '../foodRequests/request.entity';
import { Donation } from '../donations/donations.entity';

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
      where: { status: In(['pending', 'shipped']) },
    });
  }

  async getPastOrders() {
    return this.repo.find({
      where: { status: 'delivered' },
    });
  }

  async findOne(orderId: number) {
    if (!orderId || orderId < 1) {
      throw new NotFoundException('Invalid order ID');
    }
    return await this.repo.findOne({
      where: { orderId },
    });
  }

  async findOrderByRequest(requestId: number): Promise<Order | null> {
    const order = await this.repo.findOne({
      where: { requestId },
      relations: ['request'],
    });

    if (!order) {
      return null;
    } else {
      return order;
    }
  }

  async findOrderPantry(orderId: number): Promise<Pantry | null> {
    const order = await this.repo.findOne({
      where: { orderId },
      relations: ['pantry'],
    });

    if (!order) {
      return null;
    } else {
      return order.pantry;
    }
  }

  async findOrderFoodRequest(orderId: number): Promise<FoodRequest | null> {
    const order = await this.repo.findOne({
      where: { orderId },
      relations: ['request'],
    });

    if (!order) {
      return null;
    } else {
      return order.request;
    }
  }

  async findOrderFoodManufacturer(
    orderId: number,
  ): Promise<FoodManufacturer | null> {
    const order = this.findOne(orderId);
    return (await order).foodManufacturer;
  }

  async findOrderDonation(orderId: number): Promise<Donation | null> {
    const order = await this.repo.findOne({
      where: { orderId },
      relations: ['donation'],
    });

    if (!order) {
      return null;
    } else {
      return order.donation;
    }
  }

  async updateStatus(orderId: number, newStatus: string) {
    if (!orderId || orderId < 1) {
      throw new NotFoundException('Invalid order ID');
    }

    // TODO: Once we start navigating to proper food manufacturer page, change the 1 to be the proper food manufacturer id
    await this.repo
      .createQueryBuilder()
      .update(Order)
      .set({
        status: newStatus,
        shippedBy: 1,
        shippedAt: newStatus === 'shipped' ? new Date() : null,
        deliveredAt: newStatus === 'delivered' ? new Date() : null,
      })
      .where('order_id = :orderId', { orderId })
      .execute();
  }
}
