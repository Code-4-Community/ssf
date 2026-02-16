import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User } from './user.entity';
import { Role } from './types';
import { validateId } from '../utils/validation.utils';
import { Pantry } from '../pantries/pantries.entity';
import { PantriesService } from '../pantries/pantries.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private repo: Repository<User>,

    private pantriesService: PantriesService,
  ) {}

  async create(
    email: string,
    firstName: string,
    lastName: string,
    phone: string,
    role: Role,
  ) {
    const user = this.repo.create({
      role,
      firstName,
      lastName,
      email,
      phone,
    });

    return this.repo.save(user);
  }

  async findOne(id: number): Promise<User> {
    validateId(id, 'User');

    const user = await this.repo.findOneBy({ id });

    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }
    return user;
  }

  find(email: string) {
    return this.repo.find({ where: { email } });
  }

  async update(id: number, attrs: Partial<User>) {
    validateId(id, 'User');

    const user = await this.findOne(id);

    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }

    Object.assign(user, attrs);

    return this.repo.save(user);
  }

  async remove(id: number) {
    validateId(id, 'User');

    const user = await this.findOne(id);

    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }

    return this.repo.remove(user);
  }

  async findUsersByRoles(roles: Role[]): Promise<User[]> {
    return this.repo.find({
      where: { role: In(roles) },
      relations: ['pantries'],
    });
  }
}
