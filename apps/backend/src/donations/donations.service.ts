import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Donation } from './donations.entity';
import { validateId } from '../utils/validation.utils';
import { FoodManufacturer } from '../foodManufacturers/manufacturer.entity';
import { DonationStatus, RecurrenceEnum } from './types';

@Injectable()
export class DonationService {
  constructor(
    @InjectRepository(Donation) private repo: Repository<Donation>,
    @InjectRepository(FoodManufacturer)
    private manufacturerRepo: Repository<FoodManufacturer>,
  ) {}

  async findOne(donationId: number): Promise<Donation> {
    validateId(donationId, 'Donation');

    const donation = await this.repo.findOne({
      where: { donationId },
      relations: ['foodManufacturer'],
    });

    if (!donation) {
      throw new NotFoundException(`Donation ${donationId} not found`);
    }
    return donation;
  }

  async getAll() {
    return this.repo.find({
      relations: ['foodManufacturer'],
    });
  }

  async getNumberOfDonations(): Promise<number> {
    return this.repo.count();
  }

  async create(
    foodManufacturerId: number,
    dateDonated: Date,
    status: DonationStatus,
    totalItems: number,
    totalOz: number,
    totalEstimatedValue: number,
    recurrence: RecurrenceEnum,
    recurrenceFreq: number | undefined,
    nextDonationDates: Date[] | undefined,
    occurencesRemaining: number | undefined,
  ): Promise<Donation> {
    validateId(foodManufacturerId, 'Food Manufacturer');
    const manufacturer = await this.manufacturerRepo.findOne({
      where: { foodManufacturerId },
    });

    if (!manufacturer) {
      throw new NotFoundException(
        `Food Manufacturer ${foodManufacturerId} not found`,
      );
    }
    const donation = this.repo.create({
      foodManufacturer: manufacturer,
      dateDonated,
      status,
      totalItems,
      totalOz,
      totalEstimatedValue,
      recurrence,
      recurrenceFreq,
      nextDonationDates,
      occurencesRemaining,
    });

    return this.repo.save(donation);
  }

  async fulfill(donationId: number): Promise<Donation> {
    validateId(donationId, 'Donation');

    const donation = await this.repo.findOneBy({ donationId });
    if (!donation) {
      throw new NotFoundException(`Donation ${donationId} not found`);
    }
    donation.status = DonationStatus.FULFILLED;
    return this.repo.save(donation);
  }
}
