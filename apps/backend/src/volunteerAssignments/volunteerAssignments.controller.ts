import { Controller, Get } from '@nestjs/common';
import { AssignmentsService } from './volunteerAssignments.service';
import { Assignments } from './volunteerAssignments.entity';

@Controller('assignments')
export class AssignmentsController {
  constructor(private assignmentsService: AssignmentsService) {}

  @Get('/assignments')
  async getAssignments(): Promise<Assignments[]> {
    return this.assignmentsService.getAssignments();
  }
}
