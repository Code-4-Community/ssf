import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pantry } from './pantries.entity';
import { User } from '../users/user.entity';
import { validateId } from '../utils/validation.utils';
import { PantriesStatus } from './types';

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
    return await this.repo.find({ where: { status: PantriesStatus.PENDING } });
  }

  async approve(id: number) {
    validateId(id, 'Pantry');

    const pantry = await this.repo.findOne({ where: { pantryId: id } });
    if (!pantry) {
      throw new NotFoundException(`Pantry ${id} not found`);
    }

    await this.repo.update(id, { status: PantriesStatus.APPROVED });
  }

  async deny(id: number) {
    validateId(id, 'Pantry');

    const pantry = await this.repo.findOne({ where: { pantryId: id } });
    if (!pantry) {
      throw new NotFoundException(`Pantry ${id} not found`);
    }

    await this.repo.update(id, { status: PantriesStatus.DENIED });
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
