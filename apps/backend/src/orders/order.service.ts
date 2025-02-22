import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './order.entity';

@Injectable()
export class OrdersService {
  constructor(@InjectRepository(Order) private repo: Repository<Order>) {}

  async getAll() {
    return this.repo.find({
      relations: ['requestId', 'pantryId', 'shippedBy'],
    });
  }

  async findOne(orderId: number) {
    if (!orderId || orderId < 1) {
      throw new NotFoundException('Invalid order ID');
    }
    return await this.repo.findOne({
      where: { orderId },
      relations: ['requestId', 'pantryId', 'shippedBy'],
    });
  }

  async updateStatus(orderId: number, newStatus: string) {
    if (!orderId || orderId < 1) {
      throw new NotFoundException('Invalid order ID');
    }
    await this.repo
      .createQueryBuilder()
      .update(Order)
      .set({ status: newStatus })
      .where('order_id = :orderId', { orderId: orderId })
      .execute();
  }
}
