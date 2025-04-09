import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FoodManufacturer } from './manufacturer.entity';

@Injectable()
export class ManufacturerService {
  constructor(
    @InjectRepository(FoodManufacturer)
    private repo: Repository<FoodManufacturer>,
  ) {}

  async updateManufacturerFrequency(
    manufacturerId: number,
    donationFrequency: string,
  ): Promise<FoodManufacturer | null> {
    const manufacturer = await this.repo.findOne({
      where: { foodManufacturerId: manufacturerId },
    });
    if (!manufacturer) {
      return null;
    }
    manufacturer.donationFrequency = donationFrequency;
    return this.repo.save(manufacturer);
  }

  async getDetails(manufacturerId: number): Promise<FoodManufacturer | null> {
    if (!manufacturerId || manufacturerId < 1) {
      throw new NotFoundException('Invalid manufacturer ID');
    }
    return await this.repo.findOne({
      where: { foodManufacturerId: manufacturerId },
      relations: ['foodManufacturerRepresentative'],
      select: {
        foodManufacturerId: true,
        foodManufacturerName: true,
        industry: true,
        email: true,
        phone: true,
        address: true,
        signupDate: true,
        donationFrequency: true,
        foodManufacturerRepresentative: {
          firstName: true,
          lastName: true,
        },
      },
    });
  }
}
