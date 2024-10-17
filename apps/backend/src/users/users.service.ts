import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from './user.entity';
import { Status } from './types';
import { Pantry } from '../pantries/pantry.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private repo: Repository<User>,
    @InjectRepository(Pantry) private pantryRepo: Repository<Pantry>,
  ) {}

  async create(email: string, firstName: string, lastName: string) {
    const userId = (await this.repo.count()) + 1;
    const user = this.repo.create({
      id: userId,
      status: Status.STANDARD,
      firstName,
      lastName,
      email,
    });

    return this.repo.save(user);
  }

  findOne(id: number) {
    if (!id) {
      return null;
    }

    return this.repo.findOneBy({ id });
  }

  find(email: string) {
    return this.repo.find({ where: { email } });
  }

  async update(id: number, attrs: Partial<User>) {
    const user = await this.findOne(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    Object.assign(user, attrs);

    return this.repo.save(user);
  }

  async remove(id: number) {
    const user = await this.findOne(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.repo.remove(user);
  }
  async getSSFContactByPantryId(pantryId: number) {
    const pantry = await this.pantryRepo.findOne({
      where: { id: pantryId },
      relations: ['ssfRepresentative'],
    });

    if (!pantry) {
      throw new NotFoundException('Pantry not found');
    }

    const ssfContact = pantry.ssfRepresentative;
    if (!ssfContact) {
      throw new NotFoundException('SSF contact not found');
    }

    return {
      contactName: `${ssfContact.firstName} ${ssfContact.lastName}`,
      contactEmail: ssfContact.email,
    };
  }
}
