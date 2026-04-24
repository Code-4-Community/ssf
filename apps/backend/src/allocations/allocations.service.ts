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

  // This function assumes that orderId and itemAllocations were already correctly validated (see call in create method of OrdersService)
  async createMultiple(
    orderId: number,
    itemAllocations: Map<number, number>,
    transactionManager?: EntityManager,
  ): Promise<Allocation[]> {
    const allocationTransactionRepo = transactionManager
      ? transactionManager.getRepository(Allocation)
      : undefined;
    const itemTransactionRepo = transactionManager
      ? transactionManager.getRepository(DonationItem)
      : undefined;
    const targetAllocationRepo = allocationTransactionRepo
      ? allocationTransactionRepo
      : this.repo;
    const targetItemRepo = itemTransactionRepo
      ? itemTransactionRepo
      : this.donationItemRepo;

    validateId(orderId, 'Order');

    const allocations: Allocation[] = [];

    for (const [itemId, quantity] of itemAllocations) {
      validateId(itemId, 'Donation Item');

      allocations.push(
        targetAllocationRepo.create({
          orderId,
          itemId,
          allocatedQuantity: quantity,
        }),
      );

      await targetItemRepo.increment({ itemId }, 'reservedQuantity', quantity);
    }

    return targetAllocationRepo.save(allocations);
  }
}
