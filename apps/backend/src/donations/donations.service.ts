import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Donation } from './donations.entity';
import { validateId } from '../utils/validation.utils';

@Injectable()
export class DonationService {
  constructor(@InjectRepository(Donation) private repo: Repository<Donation>) {}

  async findOne(donationId: number): Promise<Donation> {
    validateId(donationId, 'Donation');

    const donation = await this.repo.findOne({
      where: { donationId },
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

  async create(
    foodManufacturerId: number,
    dateDonated: Date,
    status: string,
    totalItems: number,
    totalOz: number,
    totalEstimatedValue: number,
  ) {
    const donation = this.repo.create({
      foodManufacturerId,
      dateDonated,
      status,
      totalItems,
      totalOz,
      totalEstimatedValue,
    });

    return this.repo.save(donation);
  }

  async fulfill(donationId: number): Promise<Donation> {
    validateId(donationId, 'Donation');

    const donation = await this.repo.findOneBy({ donationId });
    if (!donation) {
      throw new NotFoundException(`Donation ${donationId} not found`);
    }
    donation.status = 'fulfilled';
    return this.repo.save(donation);
  }
}
