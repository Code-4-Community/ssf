import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pantry } from './pantries.entity';
import { User } from '../users/user.entity';
import { validateId } from '../utils/validation.utils';

@Injectable()
export class PantriesService {
  constructor(@InjectRepository(Pantry) private repo: Repository<Pantry>) {}

  async findOne(pantryId: number): Promise<Pantry> {
    validateId(pantryId, 'Pantry');

    const pantry = await this.repo.findOne({ where: { pantryId } });

    if (!pantry) {
      throw new NotFoundException(`Pantry ${pantryId} not found`);
    }
    return pantry;
  }

  async getPendingPantries(): Promise<Pantry[]> {
    return await this.repo.find({ where: { status: 'pending' } });
  }

  async approve(id: number) {
    validateId(id, 'Pantry');

    const result = await this.repo
      .createQueryBuilder()
      .update(Pantry)
      .set({ status: 'approved' })
      .where('pantry_id = :pantryId', { pantryId: id })
      .execute();

    if (result.affected === 0) {
      throw new NotFoundException(`Pantry ${id} not found`);
    }
  }

  async deny(id: number) {
    validateId(id, 'Pantry');

    const result = await this.repo
      .createQueryBuilder()
      .update(Pantry)
      .set({ status: 'denied' })
      .where('pantry_id = :pantryId', { pantryId: id })
      .execute();

    if (result.affected === 0) {
      throw new NotFoundException(`Pantry ${id} not found`);
    }
  }

  async findSSFRep(pantryId: number): Promise<User> {
    validateId(pantryId, 'Pantry');

    const pantry = await this.repo.findOne({
      where: { pantryId },
      relations: ['ssfRepresentative'],
    });

    if (!pantry) {
      throw new NotFoundException(`Pantry ${pantryId} not found`);
    }

    return pantry.ssfRepresentative;
  }
}
