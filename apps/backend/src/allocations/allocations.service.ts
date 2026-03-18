import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Allocation } from '../allocations/allocations.entity';
import { validateId } from '../utils/validation.utils';
import { DonationItem } from '../donationItems/donationItems.entity';

@Injectable()
export class AllocationsService {
  constructor(
    @InjectRepository(Allocation) private repo: Repository<Allocation>,
    @InjectRepository(DonationItem)
    private donationItemRepo: Repository<DonationItem>,
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
    orderId: number,
    itemAllocations: Record<number, number>,
    manager?: EntityManager,
  ): Promise<Allocation[]> {
    const repo = manager ? manager.getRepository(Allocation) : this.repo;
    const itemRepo = manager
      ? manager.getRepository(DonationItem)
      : this.donationItemRepo;

    validateId(orderId, 'Order');

    const allocations: Allocation[] = [];

    for (const [itemIdStr, quantity] of Object.entries(itemAllocations)) {
      const itemId = Number(itemIdStr);
      validateId(itemId, 'Donation Item');

      allocations.push(
        repo.create({
          orderId,
          itemId,
          allocatedQuantity: quantity,
        }),
      );

      await itemRepo.increment({ itemId }, 'reservedQuantity', quantity);
    }

    return repo.save(allocations);
  }
}
