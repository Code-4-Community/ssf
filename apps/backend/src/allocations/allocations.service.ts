import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Allocation } from '../allocations/allocations.entity';

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
        status: true,
      },
    });
  }
}
