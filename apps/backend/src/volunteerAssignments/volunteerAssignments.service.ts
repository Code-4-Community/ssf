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

  // Gets the assignment id, the volunteer type, and the corresponding volunteer's firstName/id,
  // and the corresponding pantry's pantryId/pantryName, sets pantry to null if pantryId is null.
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
