import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Assignments } from './volunteerAssignments.entity';
import { VolunteerType } from './types';

@Injectable()
export class AssignmentsService {
  constructor(
    @InjectRepository(Assignments) private repo: Repository<Assignments>,
  ) {}

  // Gets the assignment id, the volunteer type, and the corresponding volunteer's firstName/id,
  // and the corresponding pantry's pantryId/pantryName
  async findAllRelations() {
    return await this.repo.find({
      relations: ['volunteer', 'pantry'],
      select: {
        assignmentId: true,
        volunteerType: true,
        volunteer: {
          id: true,
          firstName: true,
        },
        pantry: {
          pantryId: true,
          pantryName: true,
        },
      },
    });
  }

  async updateVolunteerType(userId: number, volunteerType: VolunteerType) {
    await this.repo.update({ volunteerId: userId }, { volunteerType });
  }
}
