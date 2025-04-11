import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Donation } from './donations.entity';

@Injectable()
export class DonationService {
  constructor(@InjectRepository(Donation) private repo: Repository<Donation>) {}

  async findOne(donationId: number) {
    if (!donationId || donationId < 1) {
      throw new NotFoundException('Invalid donation ID');
    }
    return await this.repo.findOne({
      where: { donationId },
    });
  }

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

  async fulfill(donationId: number): Promise<Donation | null> {
    const donation = await this.repo.findOneBy({ donationId });
    if (!donation) {
      return null;
    }
    donation.status = 'fulfilled';
    return this.repo.save(donation);
  }
}
