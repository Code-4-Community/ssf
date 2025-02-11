import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Donation } from './donations.entity';

@Injectable()
export class DonationService {
  constructor(@InjectRepository(Donation) private repo: Repository<Donation>) {}

  async getAll() {
    return this.repo.find();
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
}
