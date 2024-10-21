import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Pantry } from './pantry.entity';

@Injectable()
export class PantriesService {
  constructor(@InjectRepository(Pantry) private repo: Repository<Pantry>) {}

  findOne(id: number) {
    if (!id) {
      return null;
    }
    return this.repo.findOneBy({ id });
  }

  approve(id: number) {
    this.repo
      .createQueryBuilder()
      .update(Pantry)
      .set({ approved: true })
      .where('id = :id', { id: id })
      .execute();
  }
  getNonApprovedPantries() {
    return this.repo.find({
      where: {
        approved: false,
      },
    });
  }
}
