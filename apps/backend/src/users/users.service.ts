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
import { updateUserInfo } from './dtos/updateUserInfo.dto';

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

  async findVolunteer(volunteerId: number): Promise<User> {
    validateId(volunteerId, 'Volunteer');

    const volunteer = await this.repo.findOne({
      where: { id: volunteerId },
      relations: ['pantries'],
    });

    if (!volunteer)
      throw new NotFoundException(`User ${volunteerId} not found`);
    if (volunteer.role !== Role.VOLUNTEER) {
      throw new BadRequestException(`User ${volunteerId} is not a volunteer`);
    }
    return volunteer;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.repo.findOneBy({ email });
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return user;
  }

  async update(id: number, dto: updateUserInfo): Promise<User> {
    validateId(id, 'User');

    const { firstName, lastName, phone } = dto;

    if (
      firstName === undefined &&
      lastName === undefined &&
      phone === undefined
    ) {
      throw new BadRequestException(
        'At least one field must be provided to update',
      );
    }

    const user = await this.findOne(id);

    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (phone !== undefined) user.phone = phone;

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

  async getVolunteersAndPantryAssignments(): Promise<
    (Omit<User, 'pantries'> & { pantryIds: number[] })[]
  > {
    const volunteers = await this.findUsersByRoles([Role.VOLUNTEER]);

    return volunteers.map((v) => {
      const { pantries, ...volunteerWithoutPantries } = v;
      return {
        ...volunteerWithoutPantries,
        pantryIds: pantries.map((p) => p.pantryId),
      };
    });
  }

  async getVolunteerPantries(volunteerId: number): Promise<Pantry[]> {
    const volunteer = await this.findVolunteer(volunteerId);
    return volunteer.pantries;
  }

  async assignPantriesToVolunteer(
    volunteerId: number,
    pantryIds: number[],
  ): Promise<User> {
    pantryIds.forEach((id) => validateId(id, 'Pantry'));

    const volunteer = await this.findVolunteer(volunteerId);

    const pantries = await this.pantriesService.findByIds(pantryIds);
    const existingPantryIds = volunteer.pantries.map((p) => p.pantryId);
    const newPantries = pantries.filter(
      (p) => !existingPantryIds.includes(p.pantryId),
    );

    volunteer.pantries = [...volunteer.pantries, ...newPantries];
    return this.repo.save(volunteer);
  }

  async findUserByCognitoId(cognitoId: string): Promise<User> {
    const user = await this.repo.findOneBy({ userCognitoSub: cognitoId });
    if (!user) {
      throw new NotFoundException(`User with cognitoId ${cognitoId} not found`);
    }
    return user;
  }
}
