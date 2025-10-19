import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Assignments } from './volunteerAssignments.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class AssignmentsService {
  constructor(
    @InjectRepository(Assignments) private repo: Repository<Assignments>,
    private usersService: UsersService,
  ) {}

  // Gets the assignment id, volunteer details and the corresponding pantry
  async getAssignments() {
    const results = await this.repo.find({
      relations: ['volunteer', 'pantry'],
      select: {
        assignmentId: true,
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
