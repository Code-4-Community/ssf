import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

  async getAllDonationItems(donationId: number): Promise<DonationItem[]> {
    validateId(donationId, 'Donation');
    return this.repo.find({ where: { donation: { donationId } } });
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
