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
import { DonationStatus } from '../donations/types';
import { CreateDonationItemDto } from './dtos/create-donation-items.dto';
import { ConfirmDonationItemDetailsDto } from './dtos/confirm-donation-item-details.dto';

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

  async confirmItemDetails(
    donationId: number,
    body: ConfirmDonationItemDetailsDto[],
    transactionManager: EntityManager,
  ): Promise<void> {
    const donationItemTransactionRepo =
      transactionManager.getRepository(DonationItem);

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

      if (item.detailsConfirmed) {
        throw new BadRequestException(
          `Donation item ${dto.itemId} has already been confirmed`,
        );
      }

      await donationItemTransactionRepo.update(dto.itemId, {
        ozPerItem: dto.ozPerItem,
        estimatedValue: dto.estimatedValue,
        foodRescue: dto.foodRescue,
        detailsConfirmed: true,
      });
    }
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
      }),
    );
    return transactionRepo.save(donationItems);
  }
}
