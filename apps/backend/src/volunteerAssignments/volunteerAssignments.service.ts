import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VolunteerAssignment } from './volunteerAssignments.entity';

@Injectable()
export class AssignmentsService {
  constructor(
    @InjectRepository(VolunteerAssignment)
    private repo: Repository<VolunteerAssignment>,
  ) {}

  // Gets the volunteer details and the corresponding pantry
  async getAssignments() {
    const results = await this.repo.find({
      relations: ['volunteer', 'pantry'],
      select: {
        volunteer: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          role: true,
        },
        pantry: {
          pantryId: true,
          pantryName: true,
        },
      },
    });
    return results;
  }
}
