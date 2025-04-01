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
        foodManufacturerRepresentative: {
          firstName: true,
          lastName: true,
        },
      },
    });
  }
}
