import { Controller, Get } from '@nestjs/common';
import { AssignmentsService } from './volunteerAssignments.service';
import { Assignments } from './volunteerAssignments.entity';

@Controller('assignments')
export class AssignmentsController {
  constructor(private pantriesService: AssignmentsService) {}

  @Get('/getAllRelations')
  async getAllRelations(): Promise<Assignments[]> {
    return this.pantriesService.findAllRelations();
  }
}
