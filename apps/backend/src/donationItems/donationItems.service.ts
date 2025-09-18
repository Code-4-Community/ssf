import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DonationItem } from './donationItems.entity';

@Injectable()
export class DonationItemsService {
  constructor(
    @InjectRepository(DonationItem) private repo: Repository<DonationItem>,
  ) {}

  async getAllDonationItems(donationId: number): Promise<DonationItem[]> {
    return this.repo.findBy({ donationId });
  }

  async create(
    donationId: number,
    itemName: string,
    quantity: number,
    reservedQuantity: number,
    status: string,
    ozPerItem: number,
    estimatedValue: number,
    foodType: string,
  ) {
    const donationItem = this.repo.create({
      donationId,
      itemName,
      quantity,
      reservedQuantity,
      status,
      ozPerItem,
      estimatedValue,
      foodType,
    });

    return this.repo.save(donationItem);
  }

  async updateDonationItemQuantity(itemId: number): Promise<DonationItem> {
    const donationItem = await this.repo.findOneBy({ itemId });
    if (!donationItem) {
      throw new NotFoundException(`Donation item ${itemId} not found`);
    }
    donationItem.quantity -= 1;
    return this.repo.save(donationItem);
  }
}
