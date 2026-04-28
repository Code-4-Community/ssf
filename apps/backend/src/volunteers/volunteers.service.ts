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
import { FoodRequest } from '../foodRequests/request.entity';
import { RequestsService } from '../foodRequests/request.service';
import { EmailsService } from '../emails/email.service';
import { emailTemplates } from '../emails/emailTemplates';

@Injectable()
export class VolunteersService {
  constructor(
    @InjectRepository(User)
    private repo: Repository<User>,
    private usersService: UsersService,
    private pantriesService: PantriesService,
    private requestsService: RequestsService,
    private emailsService: EmailsService,
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
    const saved = await this.repo.save(volunteer);

    const { subject, bodyHTML } =
      emailTemplates.volunteerPantryAssignmentChanged({
        volunteerName: `${volunteer.firstName} ${volunteer.lastName}`,
      });
    await this.emailsService.sendEmails([volunteer.email], subject, bodyHTML);

    return saved;
  }

  async findRequestsByVolunteer(volunteerId: number): Promise<FoodRequest[]> {
    validateId(volunteerId, 'Volunteer');

    const pantries = await this.getVolunteerPantries(volunteerId);
    const pantryIds = pantries.map((p) => p.pantryId);

    const requestArrays = await Promise.all(
      pantryIds.map((id) => this.requestsService.find(id)),
    );

    return requestArrays.flat();
  }
}
