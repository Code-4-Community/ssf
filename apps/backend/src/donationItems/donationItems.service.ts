import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { DonationItem } from './donationItems.entity';
import { validateId } from '../utils/validation.utils';
import { FoodType } from './types';
import { Donation } from '../donations/donations.entity';

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

  async getAssociatedDonationIds(
    donationItemIds: number[],
  ): Promise<Set<number>> {
    donationItemIds.forEach((id) => validateId(id, 'Donation Item'));

    const items = await this.repo.find({
      where: { itemId: In(donationItemIds) },
      select: ['itemId', 'donationId'],
    });

    const foundIds = new Set(items.map((i) => i.itemId));

    const missingIds = donationItemIds.filter((id) => !foundIds.has(id));

    if (missingIds.length > 0) {
      throw new NotFoundException(
        `Donation items not found for ID(s): ${missingIds.join(', ')}`,
      );
    }

    return new Set(items.map((i) => i.donationId));
  }

  async create(
    donationId: number,
    itemName: string,
    quantity: number,
    reservedQuantity: number,
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
      reservedQuantity,
      ozPerItem,
      estimatedValue,
      foodType,
    });

    return this.repo.save(donationItem);
  }

  async createMultipleDonationItems(
    donationId: number,
    items: {
      itemName: string;
      quantity: number;
      reservedQuantity: number;
      ozPerItem?: number;
      estimatedValue?: number;
      foodType: FoodType;
    }[],
  ): Promise<DonationItem[]> {
    validateId(donationId, 'Donation');

    const donation = await this.donationRepo.findOneBy({ donationId });
    if (!donation) throw new NotFoundException('Donation not found');

    const donationItems = items.map((item) =>
      this.repo.create({
        donation,
        itemName: item.itemName,
        quantity: item.quantity,
        reservedQuantity: item.reservedQuantity,
        ozPerItem: item.ozPerItem,
        estimatedValue: item.estimatedValue,
        foodType: item.foodType,
      }),
    );

    return this.repo.save(donationItems);
  }

  async updateDonationItemQuantity(itemId: number): Promise<DonationItem> {
    validateId(itemId, 'Donation Item');

    const donationItem = await this.repo.findOneBy({ itemId });
    if (!donationItem) {
      throw new NotFoundException(`Donation item ${itemId} not found`);
    }
    donationItem.quantity -= 1;
    return this.repo.save(donationItem);
  }
}
