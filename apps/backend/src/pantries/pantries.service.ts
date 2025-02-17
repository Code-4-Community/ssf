import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pantry } from './pantry.entity';

@Injectable()
export class PantriesService {
  constructor(@InjectRepository(Pantry) private repo: Repository<Pantry>) {}

  async findOne(pantryId: number) {
    if (!pantryId || pantryId < 1) {
      throw new NotFoundException('Invalid pantry ID');
    }
    return await this.repo.findOne({ where: { pantryId } });
  }

  async getPendingPantries() {
    return await this.repo.find({ where: { status: 'pending' } });
  }

  async approve(id: number) {
    await this.repo
      .createQueryBuilder()
      .update(Pantry)
      .set({ status: 'approved' })
      .where('pantry_id = :pantryId', { pantryId: id })
      .execute();
  }

  async deny(id: number) {
    await this.repo
      .createQueryBuilder()
      .update(Pantry)
      .set({ status: 'denied' })
      .where('pantry_id = :pantryId', { pantryId: id })
      .execute();

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
