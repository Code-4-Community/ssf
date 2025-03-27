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

  async get(manufacturerId: number) {
    if (!manufacturerId || manufacturerId < 1) {
      throw new NotFoundException('Invalid manufacturer ID');
    }
    return await this.repo.find({
      where: { foodManufacturerId: manufacturerId },
    });
  }
}
