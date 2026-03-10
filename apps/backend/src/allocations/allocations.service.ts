import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Allocation } from '../allocations/allocations.entity';
import { CreateMultipleAllocationsDto } from './dtos/create-allocations.dto';
import { validateId } from '../utils/validation.utils';

@Injectable()
export class AllocationsService {
  constructor(
    @InjectRepository(Allocation) private repo: Repository<Allocation>,
  ) {}

  async getAllAllocationsByOrder(
    orderId: number,
  ): Promise<Partial<Allocation>[]> {
    return this.repo.find({
      where: { orderId },
      relations: ['item'],
      select: {
        allocationId: true,
        allocatedQuantity: true,
        reservedAt: true,
        fulfilledAt: true,
      },
    });
  }

  async createMultiple(
    body: CreateMultipleAllocationsDto,
  ): Promise<Allocation[]> {
    const orderId = body.orderId;
    const donationItems = body.donationItems;

    validateId(orderId, 'Order');

    const allocations: Allocation[] = [];

    for (const [itemIdStr, quantity] of Object.entries(donationItems)) {
      const itemId = Number(itemIdStr);

      validateId(itemId, 'Item');

      const allocation = this.repo.create({
        orderId,
        itemId,
        allocatedQuantity: quantity,
      });

      allocations.push(allocation);
    }

    return await this.repo.save(allocations);
  }
}
