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
  ): Promise<Allocation[] | null> {
    return this.repo.find({
      where: { orderId: orderId },
      relations: ['item'],
    });
  }
}
