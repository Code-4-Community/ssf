import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pantry } from './pantry.entity';

@Injectable()
export class PantriesService {
  constructor(
    @InjectRepository(Pantry) private readonly pantryRepo: Repository<Pantry>,
  ) {}

  async getSSFContactByPantryId(pantryId: number) {
    const pantry = await this.pantryRepo.findOne({
      where: { id: pantryId },
      relations: ['ssfRepresentative'],
    });

    if (!pantry) {
      throw new Error('Pantry not found');
    }

    const ssfContact = pantry.ssfRepresentative;
    return {
      contactName: `${ssfContact.firstName} ${ssfContact.lastName}`,
      contactEmail: ssfContact.email,
    };
  }

  async getAllActivePantries() {
    return this.pantryRepo.find({
      where: { approved: true },
      select: ['id', 'name'], //any other fields to include?
    });
  }
}
