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

  async getAll() {
    return this.repo.find();
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

  async findOne(orderId: number): Promise<Order> {
    if (!orderId || orderId < 1) {
      throw new NotFoundException('Invalid order ID');
    }
    const order = await this.repo.findOne({ where: { orderId } });
    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }
    return order;
  }

  async findOrderByRequest(requestId: number): Promise<Order> {
    const order = await this.repo.findOne({
      where: { requestId },
      relations: ['request'],
    });

    if (!order) {
      throw new NotFoundException(
        `Order with request ID ${requestId} not found`,
      );
    } else {
      return order;
    }
  }

  async findOrderPantry(orderId: number): Promise<Pantry> {
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
    const order = await this.findOne(orderId);

    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }
    return order.foodManufacturer;
  }

  async findOrderDonation(orderId: number): Promise<Donation> {
    const order = await this.repo.findOne({
      where: { orderId },
      relations: ['donation'],
    });

    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }
    return order.donation;
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
        shippedAt: newStatus === 'shipped' ? new Date() : undefined,
        deliveredAt: newStatus === 'delivered' ? new Date() : undefined,
      })
      .where('order_id = :orderId', { orderId })
      .execute();
  }
}
