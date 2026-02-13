import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Donation } from './donations.entity';
import { validateId } from '../utils/validation.utils';
import { DonationStatus } from './types';
import { CreateDonationDto } from './dtos/create-donation.dto';
import { FoodManufacturer } from '../foodManufacturers/manufacturers.entity';

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

  async getByFoodManufacturer(foodManufacturerId: number): Promise<Donation[]> {
    validateId(foodManufacturerId, 'Food Manufacturer');

    const manufacturer = await this.manufacturerRepo.findOne({
      where: { foodManufacturerId },
    });

    if (!manufacturer) {
      throw new NotFoundException(
        `Food Manufacturer ${foodManufacturerId} not found`,
      );
    }

    return this.repo.find({
      where: { foodManufacturer: { foodManufacturerId } },
      relations: ['foodManufacturer'],
    });
  }

  async create(donationData: CreateDonationDto): Promise<Donation> {
    validateId(donationData.foodManufacturerId, 'Food Manufacturer');
    const manufacturer = await this.manufacturerRepo.findOne({
      where: { foodManufacturerId: donationData.foodManufacturerId },
    });

    if (!manufacturer) {
      throw new NotFoundException(
        `Food Manufacturer ${donationData.foodManufacturerId} not found`,
      );
    }
    const donation = this.repo.create({
      foodManufacturer: manufacturer,
      dateDonated: new Date(),
      status: DonationStatus.AVAILABLE,
      totalItems: donationData.totalItems,
      totalOz: donationData.totalOz,
      totalEstimatedValue: donationData.totalEstimatedValue,
      recurrence: donationData.recurrence,
      recurrenceFreq: donationData.recurrenceFreq,
      nextDonationDates: donationData.nextDonationDates,
      occurrencesRemaining: donationData.occurrencesRemaining,
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

  async handleRecurringDonations(): Promise<void> {
    console.log('Accessing donation service from cron job');
    // TODO: Implement logic for sending reminder emails
  }
}
