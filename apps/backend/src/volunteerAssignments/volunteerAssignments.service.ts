import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Assignments } from './volunteerAssignments.entity';
import { VOLUNTEER_ROLES, VolunteerType } from './types';
import { UsersService } from '../users/users.service';

@Injectable()
export class AssignmentsService {
  constructor(
    @InjectRepository(Assignments) private repo: Repository<Assignments>,
    private usersService: UsersService,
  ) {}

  // Gets the assignment id, the volunteer type, and the corresponding volunteer's firstName/id,
  // and the corresponding pantry's pantryId/pantryName, sets pantry to null if pantryId is null.
  async findAllRelations() {
    const allVolunteerUsers = await this.usersService.findUsersByRoles(
      VOLUNTEER_ROLES,
    );

    const existingAssignments = await this.repo.find();
    const volunteersInAssignments = new Set(
      existingAssignments.map((a) => a.volunteerId),
    );

    const missingAssignments = allVolunteerUsers
      .filter((user) => !volunteersInAssignments.has(user.id))
      .map((user) => {
        const newAssignment = this.repo.create({
          volunteerId: user.id,
          volunteerType: user.role,
        });
        return newAssignment;
      });

    if (missingAssignments.length > 0) {
      await this.repo.save(missingAssignments);
    }
    const results = await this.repo.find({
      relations: ['volunteer', 'pantry'],
      select: {
        assignmentId: true,
        volunteerType: true,
        volunteer: {
          id: true,
          firstName: true,
          email: true,
          phone: true,
        },
        pantry: {
          pantryId: true,
          pantryName: true,
        },
      },
    });

    return results.map((assignment) => ({
      ...assignment,
      pantry: assignment.pantry?.pantryId ? assignment.pantry : null,
    }));
  }

  async updateVolunteerType(userId: number, volunteerType: VolunteerType) {
    await this.repo.update({ volunteerId: userId }, { volunteerType });
  }
}
