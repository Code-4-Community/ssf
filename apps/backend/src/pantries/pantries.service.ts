import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Pantry } from './pantries.entity';

@Injectable()
export class PantriesService {
  constructor(@InjectRepository(Pantry) private repo: Repository<Pantry>) {}

  findOne(pantryId: number) {
    if (!pantryId) {
      return null;
    }

    return this.repo.findOneBy({ pantryId });
  }

  async findSSFRep(pantryId: number) {
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
