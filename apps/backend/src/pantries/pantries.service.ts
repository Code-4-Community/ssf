import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pantry } from './pantry.entity';

@Injectable()
export class PantriesService {
  constructor(@InjectRepository(Pantry) private repo: Repository<Pantry>) {}

  find(pantryId: number) {
    if (!pantryId || pantryId < 1) {
      throw new NotFoundException('Invalid pantry ID');
    }
    return this.repo.find({ where: { pantryId } });
  }

  getNonApprovedPantries() {
    return this.repo.find({
      where: {
        status: 'pending',
      },
    });
  }

  approve(id: number) {
    this.repo
      .createQueryBuilder()
      .update(Pantry)
      .set({ status: 'approved' })
      .where('id = :id', { id: id })
      .execute();
  }

  deny(id: number) {
    this.repo
      .createQueryBuilder()
      .update(Pantry)
      .set({ status: 'denied' })
      .where('id = :id', { id: id })
      .execute();
  }
}
