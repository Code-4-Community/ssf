import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { User } from './user.entity';
import { Role, VOLUNTEER_ROLES } from './types';
import { validateId } from '../utils/validation.utils';
import { Assignments } from '../volunteerAssignments/volunteerAssignments.entity';
import { Pantry } from '../pantries/pantries.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private repo: Repository<User>,

    @InjectRepository(Assignments)
    private assignmentsRepo: Repository<Assignments>,
  ) {}

  async create(
    email: string,
    firstName: string,
    lastName: string,
    role: Role = Role.STANDARD_VOLUNTEER,
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
    return this.repo.find({ where: { role: In(roles) } });
  }

  async getVolunteersAndPantryAssignments() {
    const volunteers = await this.findUsersByRoles(VOLUNTEER_ROLES);

    const assignments = await this.assignmentsRepo.find({
      relations: ['pantry', 'volunteer'],
    });

    return volunteers.map((v) => {
      const assigned = assignments
        .filter((a) => a.volunteer.id == v.id)
        .map((a) => a.pantry.pantryId);
      return { ...v, pantryIds: assigned };
    });
  }

  async getVolunteerPantries(volunteerId: number) {
    validateId(volunteerId, 'Volunteer');
    const assignments = await this.assignmentsRepo.find({
      where: { volunteer: { id: volunteerId } },
      relations: ['pantry'],
    });

    return assignments.map((a) => a.pantry);
  }

  async assignPantriesToVolunteer(volunteerId: number, pantryIds: number[]) {
    validateId(volunteerId, 'Volunteer');
    const volunteer = await this.repo.findOne({ where: { id: volunteerId } });
    if (!volunteer)
      throw new NotFoundException(`Volunteer ${volunteerId} not found`);

    const pantryRepo = this.assignmentsRepo.manager.getRepository(Pantry);
    const pantries = await pantryRepo.findBy({ pantryId: In(pantryIds) });

    if (pantries.length !== pantryIds.length) {
      throw new BadRequestException('One or more pantries not found');
    }

    const assignments = pantries.map((pantry) =>
      this.assignmentsRepo.create({ volunteer, pantry }),
    );

    return this.assignmentsRepo.save(assignments);
  }
}
