import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Assignments } from './volunteerAssignments.entity';

@Injectable()
export class AssignmentsService {
  constructor(
    @InjectRepository(Assignments) private repo: Repository<Assignments>,
  ) {}

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
}
