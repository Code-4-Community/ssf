import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { Role } from '../users/types';
import { validateId } from '../utils/validation.utils';
import { Pantry } from '../pantries/pantries.entity';
import { PantriesService } from '../pantries/pantries.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class VolunteersService {
  constructor(
    @InjectRepository(User)
    private repo: Repository<User>,
    private usersService: UsersService,
    private pantriesService: PantriesService,
  ) {}

  async findOne(id: number): Promise<User> {
    validateId(id, 'Volunteer');

    const volunteer = await this.repo.findOne({
      where: { id: id },
      relations: ['pantries'],
    });

    if (!volunteer) {
      throw new NotFoundException(`Volunteer ${id} not found`);
    }
    if (volunteer.role !== Role.VOLUNTEER) {
      throw new NotFoundException(`User ${id} is not a volunteer`);
    }
    return volunteer;
  }

  async getVolunteersAndPantryAssignments(): Promise<
    (Omit<User, 'pantries'> & { pantryIds: number[] })[]
  > {
    const volunteers = await this.usersService.findUsersByRoles([
      Role.VOLUNTEER,
    ]);

    return volunteers.map((v) => {
      const { pantries, ...volunteerWithoutPantries } = v;
      return {
        ...volunteerWithoutPantries,
        pantryIds: pantries!.map((p) => p.pantryId),
      };
    });
  }

  async getVolunteerPantries(volunteerId: number): Promise<Pantry[]> {
    validateId(volunteerId, 'Volunteer');
    const volunteer = await this.findOne(volunteerId);
    return volunteer.pantries!;
  }

  async assignPantriesToVolunteer(
    volunteerId: number,
    pantryIds: number[],
  ): Promise<User> {
    pantryIds.forEach((id) => validateId(id, 'Pantry'));

    const volunteer = await this.findOne(volunteerId);

    const pantries = await this.pantriesService.findByIds(pantryIds);
    const existingPantries = volunteer.pantries!;
    const existingPantryIds = existingPantries.map((p) => p.pantryId);
    const newPantries = pantries.filter(
      (p) => !existingPantryIds.includes(p.pantryId),
    );

    volunteer.pantries = [...existingPantries, ...newPantries];
    return this.repo.save(volunteer);
  }
}
