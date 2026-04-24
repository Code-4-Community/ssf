import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/users.entity';
import { Role } from '../users/types';
import { validateId } from '../utils/validation.utils';
import { Pantry } from '../pantries/pantries.entity';
import { PantriesService } from '../pantries/pantries.service';
import { UsersService } from '../users/users.service';
import { Assignments } from './types';
import { RequestsService } from '../foodRequests/request.service';
import { FoodRequestSummaryDto } from '../foodRequests/dtos/food-request-summary.dto';

@Injectable()
export class VolunteersService {
  constructor(
    @InjectRepository(User)
    private repo: Repository<User>,
    private usersService: UsersService,
    private pantriesService: PantriesService,
    private requestsService: RequestsService,
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

  async getVolunteersAndPantryAssignments(): Promise<Assignments[]> {
    const volunteers = await this.usersService.findUsersByRoles([
      Role.VOLUNTEER,
    ]);

    return volunteers.map((v) => {
      const { pantries, ...volunteerWithoutPantries } = v;
      return {
        ...volunteerWithoutPantries,
        pantryIds: pantries?.map((p) => p.pantryId) || [],
      };
    });
  }

  async getVolunteerPantries(volunteerId: number): Promise<Pantry[]> {
    validateId(volunteerId, 'Volunteer');
    const volunteer = await this.findOne(volunteerId);
    return volunteer.pantries || [];
  }

  async assignPantriesToVolunteer(
    volunteerId: number,
    pantryIds: number[],
  ): Promise<User> {
    const volunteer = await this.findOne(volunteerId);

    const uniquePantryIds = new Set(pantryIds);

    const pantries = await this.pantriesService.findByIds([...uniquePantryIds]);
    const existingPantries = volunteer.pantries || [];
    const existingPantryIds = new Set(existingPantries.map((p) => p.pantryId));
    const newPantries = pantries.filter(
      (p) => !existingPantryIds.has(p.pantryId),
    );

    volunteer.pantries = [...existingPantries, ...newPantries];
    return this.repo.save(volunteer);
  }

  async findRequestsByVolunteer(
    volunteerId: number,
  ): Promise<FoodRequestSummaryDto[]> {
    validateId(volunteerId, 'Volunteer');

    const pantries = await this.getVolunteerPantries(volunteerId);
    const pantryIds = pantries.map((p) => p.pantryId);

    const requestArrays = await Promise.all(
      pantryIds.map((id) => this.requestsService.find(id)),
    );

    return requestArrays.flat().map((r) => ({
      requestId: r.requestId,
      requestedSize: r.requestedSize,
      requestedFoodTypes: r.requestedFoodTypes,
      additionalInformation: r.additionalInformation,
      requestedAt: r.requestedAt,
      status: r.status,
      pantry: {
        pantryId: r.pantry.pantryId,
        pantryName: r.pantry.pantryName,
      },
    }));
  }
}
