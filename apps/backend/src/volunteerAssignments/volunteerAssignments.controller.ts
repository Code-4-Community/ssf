import { Controller, Get } from '@nestjs/common';
import { AssignmentsService } from './volunteerAssignments.service';
import { VolunteerAssignment } from './volunteerAssignments.entity';

@Controller('assignments')
export class AssignmentsController {
  constructor(private assignmentsService: AssignmentsService) {}

  @Get('/')
  async getAssignments(): Promise<VolunteerAssignment[]> {
    return this.assignmentsService.getAssignments();
  }
}
