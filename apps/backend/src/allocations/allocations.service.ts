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
      },
    });
  }

  async createMultiple(
    body: CreateMultipleAllocationsDto,
  ): Promise<Allocation[]> {
    const orderId = body.orderId;
    const donationItems = body.itemAllocations;

    validateId(orderId, 'Order');

    const allocations = Object.entries(donationItems).map(
      ([itemIdStr, quantity]) => {
        const itemId = Number(itemIdStr);

        validateId(itemId, 'Donation Item');

        return this.repo.create({
          orderId,
          itemId,
          allocatedQuantity: quantity,
        });
      },
    );

    return this.repo.save(allocations);
  }
}
