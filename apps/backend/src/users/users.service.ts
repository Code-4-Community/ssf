import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from './user.entity';
import { Role } from './types';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  async create(
    email: string,
    firstName: string,
    lastName: string,
    role: Role = Role.VOLUNTEER,
  ) {
    const userId = (await this.repo.count()) + 1;
    const user = this.repo.create({
      id: userId,
      role,
      firstName,
      lastName,
      email,
    });

    return this.repo.save(user);
  }

  async findOne(id: number): Promise<User> {
    if (!id) {
      throw new NotFoundException('Invalid user ID');
    }

    const user = await this.repo.findOneBy({ id });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
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
}
