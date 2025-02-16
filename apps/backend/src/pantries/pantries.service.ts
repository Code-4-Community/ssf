import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Pantry } from './pantries.entity';
import { User } from '../users/user.entity';

@Injectable()
export class PantriesService {
  constructor(@InjectRepository(Pantry) private repo: Repository<Pantry>) {}

  async findOne(pantryId: number): Promise<Pantry | null> {
    if (!pantryId) {
      return null;
    }

    return await this.repo.findOneBy({ pantryId });
  }

  async findSSFRep(pantryId: number): Promise<User | null> {
    const pantry = await this.repo.findOne({
      where: { pantryId },
      relations: ['ssfRepresentative'],
    });

    if (!pantry) {
      return null;
    } else {
      return pantry.ssfRepresentative;
    }
  }
}
