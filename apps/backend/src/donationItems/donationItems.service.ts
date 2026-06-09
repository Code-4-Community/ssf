import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository, In } from 'typeorm';
import { DonationItem } from './donationItems.entity';
import { validateId } from '../utils/validation.utils';
import { FoodType } from './types';
import { Donation } from '../donations/donations.entity';
import { CreateDonationItemDto } from './dtos/create-donation-items.dto';
import { UpdateDonationItemDetailsDto } from './dtos/update-donation-item-details.dto';
import { ReplaceDonationItemDto } from './dtos/replace-donation-item.dto';

@Injectable()
export class DonationItemsService {
  constructor(
    @InjectRepository(DonationItem) private repo: Repository<DonationItem>,
    @InjectRepository(Donation) private donationRepo: Repository<Donation>,
  ) {}

  async findOne(itemId: number): Promise<DonationItem> {
    validateId(itemId, 'Donation Item');

    const donationItem = await this.repo.findOneBy({ itemId });
    if (!donationItem) {
      throw new NotFoundException(`Donation item ${itemId} not found`);
    }
    return donationItem;
  }

  async getAllDonationItems(donationId: number): Promise<DonationItem[]> {
    validateId(donationId, 'Donation');
    return this.repo.find({ where: { donation: { donationId } } });
  }

  async getByIds(donationItemIds: number[]): Promise<DonationItem[]> {
    donationItemIds.forEach((id) => validateId(id, 'Donation Item'));

    const items = await this.repo.find({
      where: { itemId: In(donationItemIds) },
    });

    const foundIds = new Set(items.map((item) => item.itemId));

    const missingIds = donationItemIds.filter((id) => !foundIds.has(id));

    if (missingIds.length > 0) {
      throw new NotFoundException(
        `Donation items not found for ID(s): ${missingIds.join(', ')}`,
      );
    }

    return items;
  }

  async create(
    donationId: number,
    itemName: string,
    quantity: number,
    ozPerItem: number,
    estimatedValue: number,
    foodType: FoodType,
  ) {
    validateId(donationId, 'Donation');
    const donation = await this.donationRepo.findOneBy({ donationId });
    if (!donation) throw new NotFoundException('Donation not found');

    const donationItem = this.repo.create({
      donation,
      itemName,
      quantity,
      reservedQuantity: 0,
      ozPerItem,
      estimatedValue,
      foodType,
    });

    return this.repo.save(donationItem);
  }

  async updateItemDetails(
    donationId: number,
    body: UpdateDonationItemDetailsDto[],
    transactionManager: EntityManager,
  ): Promise<boolean> {
    const donationItemTransactionRepo =
      transactionManager.getRepository(DonationItem);

    let confirmedDetailsForAnItem = false;

    for (const dto of body) {
      const item = await donationItemTransactionRepo.findOneBy({
        itemId: dto.itemId,
      });

      if (!item) {
        throw new NotFoundException(`Donation item ${dto.itemId} not found`);
      }

      if (item.donationId !== donationId) {
        throw new BadRequestException(
          `Donation item ${dto.itemId} does not belong to Donation ${donationId}`,
        );
      }

      const updateData: Partial<DonationItem> = {};
      if (dto.ozPerItem !== undefined) updateData.ozPerItem = dto.ozPerItem;
      if (dto.estimatedValue !== undefined)
        updateData.estimatedValue = dto.estimatedValue;
      if (dto.foodRescue !== undefined) updateData.foodRescue = dto.foodRescue;

      // If included in DTO, keep it, otherwise use whatever is in the DB (could be null)
      const resultingOzPerItem =
        updateData.ozPerItem !== undefined
          ? updateData.ozPerItem
          : item.ozPerItem;
      const resultingEstimatedValue =
        updateData.estimatedValue !== undefined
          ? updateData.estimatedValue
          : item.estimatedValue;

      if (resultingOzPerItem != null && resultingEstimatedValue != null) {
        updateData.detailsConfirmed = true;
        confirmedDetailsForAnItem = true;
      }

      await donationItemTransactionRepo.update(dto.itemId, updateData);
    }

    return confirmedDetailsForAnItem;
  }

  async editItems(
    donationId: number,
    body: ReplaceDonationItemDto[],
    transactionManager: EntityManager,
  ): Promise<void> {
    const itemRepo = transactionManager.getRepository(DonationItem);

    const existingItems = await itemRepo.find({ where: { donationId } });
    const existingIds = new Set(existingItems.map((item) => item.itemId));

    const providedIds = new Set<number>();
    for (const dto of body) {
      if (dto.itemId === undefined) continue;

      if (providedIds.has(dto.itemId)) {
        throw new BadRequestException(
          `Duplicate itemId ${dto.itemId} in request`,
        );
      }
      providedIds.add(dto.itemId);

      if (!existingIds.has(dto.itemId)) {
        throw new BadRequestException(
          `Donation item ${dto.itemId} does not belong to Donation ${donationId}`,
        );
      }
    }

    const idsToDelete = existingItems
      .map((item) => item.itemId)
      .filter((id) => !providedIds.has(id));

    if (idsToDelete.length > 0) {
      await itemRepo.delete({ itemId: In(idsToDelete) });
    }

    const itemsToSave = body.map((dto) =>
      itemRepo.create({
        ...(dto.itemId !== undefined
          ? { itemId: dto.itemId }
          : { donationId, reservedQuantity: 0 }),
        itemName: dto.itemName,
        quantity: dto.quantity,
        ozPerItem: dto.ozPerItem,
        estimatedValue: dto.estimatedValue,
        foodType: dto.foodType,
        foodRescue: dto.foodRescue,
        detailsConfirmed: true,
      }),
    );

    await itemRepo.save(itemsToSave);
  }

  async createMultiple(
    savedDonation: Donation,
    items: CreateDonationItemDto[],
    transactionManager: EntityManager,
  ): Promise<DonationItem[]> {
    const transactionRepo = transactionManager.getRepository(DonationItem);

    const donationItems = items.map((item) =>
      transactionRepo.create({
        donation: savedDonation,
        itemName: item.itemName,
        quantity: item.quantity,
        reservedQuantity: 0,
        ozPerItem: item.ozPerItem,
        estimatedValue: item.estimatedValue,
        foodType: item.foodType,
        foodRescue: item.foodRescue,
        detailsConfirmed: item.ozPerItem != null && item.estimatedValue != null,
      }),
    );
    return transactionRepo.save(donationItems);
  }
}
