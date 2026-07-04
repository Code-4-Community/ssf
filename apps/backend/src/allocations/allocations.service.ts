import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Allocation } from '../allocations/allocations.entity';
import { validateId } from '../utils/validation.utils';
import { DonationItem } from '../donationItems/donationItems.entity';
import { Donation } from '../donations/donations.entity';
import { DonationItemsService } from '../donationItems/donationItems.service';
import { DonationService } from '../donations/donations.service';
import { Order } from '../orders/order.entity';
import { UpdateAllocationsDto } from '../orders/dtos/update-allocations.dto';

@Injectable()
export class AllocationsService {
  constructor(
    @InjectRepository(Allocation) private repo: Repository<Allocation>,
    @InjectRepository(DonationItem)
    private donationItemRepo: Repository<DonationItem>,
    @InjectRepository(Donation) private donationRepo: Repository<Donation>,
    private donationItemsService: DonationItemsService,
    private donationService: DonationService,
  ) {}

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

  async deleteMultiple(
    allocations: Allocation[],
    transactionManager?: EntityManager,
  ): Promise<void> {
    if (allocations.length === 0) return;

    const targetAllocationRepo = transactionManager
      ? transactionManager.getRepository(Allocation)
      : this.repo;
    const targetItemRepo = transactionManager
      ? transactionManager.getRepository(DonationItem)
      : this.donationItemRepo;

    for (const allocation of allocations) {
      await targetItemRepo.decrement(
        { itemId: allocation.itemId },
        'reservedQuantity',
        allocation.allocatedQuantity,
      );
    }

    await targetAllocationRepo.remove(allocations);
  }

  async freeAllByOrder(
    orderId: number,
    transactionManager?: EntityManager,
  ): Promise<void> {
    const targetAllocationRepo = transactionManager
      ? transactionManager.getRepository(Allocation)
      : this.repo;

    validateId(orderId, 'Order');

    // All orders have allocations so this will have something.
    const allocations = await targetAllocationRepo.find({ where: { orderId } });

    await this.deleteMultiple(allocations, transactionManager);
  }

  async updateOrderAllocations(
    order: Order,
    dto: UpdateAllocationsDto,
    transactionManager: EntityManager,
  ): Promise<void> {
    const allocationRepo = transactionManager.getRepository(Allocation);
    const itemRepo = transactionManager.getRepository(DonationItem);

    // Parse the body into edits (existing allocations) and creates (new items).
    const editQuantities = new Map<number, number>();
    const createQuantities = new Map<number, number>();

    // Validate DTO IDs
    for (const entry of dto.allocations) {
      if (entry.allocationId != null && entry.donationItemId != null) {
        throw new BadRequestException(
          'Each allocation may only contain one of: allocation id OR donation item id',
        );
      } else if (entry.allocationId != null) {
        if (editQuantities.has(entry.allocationId)) {
          throw new BadRequestException(
            `Duplicate allocation ID ${entry.allocationId} in request`,
          );
        }
        editQuantities.set(entry.allocationId, entry.allocatedQuantity);
      } else if (entry.donationItemId != null) {
        if (createQuantities.has(entry.donationItemId)) {
          throw new BadRequestException(
            `Duplicate donation item ID ${entry.donationItemId} in request`,
          );
        }
        createQuantities.set(entry.donationItemId, entry.allocatedQuantity);
      } else {
        throw new BadRequestException(
          'Each allocation must include either an allocationId or a donationItemId',
        );
      }
    }

    // Get all current allocations
    const existingAllocations = await allocationRepo.find({
      where: { orderId: order.orderId },
    });
    const existingById = new Map(
      existingAllocations.map((a) => [a.allocationId, a]),
    );

    // Verify all edited allocations belong to the order
    for (const allocationId of editQuantities.keys()) {
      if (!existingById.has(allocationId)) {
        throw new BadRequestException(
          `Allocation ${allocationId} does not belong to order ${order.orderId}`,
        );
      }
    }

    // Sort all current allocations by update or delete
    const allocationsToUpdate: { allocationId: number; quantity: number }[] =
      [];
    const allocationsToDelete: Allocation[] = [];
    const itemDeltas = new Map<number, number>();
    const addDelta = (itemId: number, delta: number) =>
      itemDeltas.set(itemId, (itemDeltas.get(itemId) ?? 0) + delta);

    for (const existing of existingAllocations) {
      const newQuantity = editQuantities.get(existing.allocationId);
      if (newQuantity === undefined) {
        // Was set to 0 on clientside, so thus not referenced and to be deleted
        allocationsToDelete.push(existing);
        addDelta(existing.itemId, -existing.allocatedQuantity);
      } else {
        // Calculate how much quantity needs to go back to the DI
        allocationsToUpdate.push({
          allocationId: existing.allocationId,
          quantity: newQuantity,
        });
        addDelta(existing.itemId, newQuantity - existing.allocatedQuantity);
      }
    }

    // Populate create map and all quantities needed to be taken
    const createMap = new Map<number, number>();
    for (const [itemId, quantity] of createQuantities) {
      createMap.set(itemId, quantity);
      addDelta(itemId, quantity);
    }

    // Validate that every single donation item being affected exists
    const involvedItemIds = [
      ...new Set([
        ...existingAllocations.map((a) => a.itemId),
        ...createMap.keys(),
      ]),
    ];
    const items = await this.donationItemsService.getByIds(involvedItemIds);
    const itemsById = new Map(items.map((item) => [item.itemId, item]));

    // Verify all involved donation items are part of the FM donations
    const fmDonations = await this.donationRepo.find({
      where: {
        foodManufacturer: { foodManufacturerId: order.foodManufacturerId },
      },
      select: ['donationId'],
    });
    const fmDonationIdSet = new Set(fmDonations.map((d) => d.donationId));
    const invalidItems = items.filter(
      (item) => !fmDonationIdSet.has(item.donationId),
    );
    if (invalidItems.length > 0) {
      const messages = invalidItems.map(
        (item) =>
          `Donation item ID ${item.itemId} with Donation ID ${item.donationId}`,
      );
      throw new BadRequestException(
        `The following donation items are not associated with the order's food manufacturer: ${messages.join(
          ', ',
        )}`,
      );
    }

    // Make sure no item ends up over-allocated or below zero.
    for (const [itemId, delta] of itemDeltas) {
      const item = itemsById.get(itemId)!;
      const resultingReserved = item.reservedQuantity + delta;
      if (resultingReserved > item.quantity) {
        throw new BadRequestException(
          `Donation item ${itemId} allocated quantity exceeds remaining quantity`,
        );
      }
      if (resultingReserved < 0) {
        throw new BadRequestException(
          `Donation item ${itemId} would have a negative reserved quantity`,
        );
      }
    }

    // Update edited allocations in place, adjusting reservedQuantity
    for (const { allocationId, quantity } of allocationsToUpdate) {
      const existing = existingById.get(allocationId)!;
      const delta = quantity - existing.allocatedQuantity;
      await allocationRepo.update(allocationId, {
        allocatedQuantity: quantity,
      });
      if (delta > 0) {
        await itemRepo.increment(
          { itemId: existing.itemId },
          'reservedQuantity',
          delta,
        );
      } else if (delta < 0) {
        await itemRepo.decrement(
          { itemId: existing.itemId },
          'reservedQuantity',
          -delta,
        );
      }
    }

    // Delete all allocations marked for deletion (handles freeing allocations)
    if (allocationsToDelete.length > 0) {
      await this.deleteMultiple(allocationsToDelete, transactionManager);
    }

    // Create all new allocations
    if (createMap.size > 0) {
      await this.createMultiple(order.orderId, createMap, transactionManager);
    }

    // Recheck affected donations' status to see which have become available or matched
    const affectedDonationIds = [
      ...new Set(items.map((item) => item.donationId)),
    ];
    await this.donationService.recheckDonationAllocationStatus(
      affectedDonationIds,
      transactionManager,
    );
  }
}
