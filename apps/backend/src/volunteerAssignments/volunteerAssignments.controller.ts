import {
  Controller,
  Get,
  Put,
  Param,
  ParseIntPipe,
  Body,
} from '@nestjs/common';
import { AssignmentsService } from './volunteerAssignments.service';
import { Assignments } from './volunteerAssignments.entity';
import { VolunteerType } from './types';

@Controller('assignments')
export class AssignmentsController {
  constructor(private pantriesService: AssignmentsService) {}

  @Get('/getAllRelations')
  async getAllRelations(): Promise<Assignments[]> {
    return this.pantriesService.findAllRelations();
  }

  @Put('/updateVolunteerType/:assignmentId')
  async updateVolunteerType(
    @Param('assignmentId', ParseIntPipe) assignmentId: number,
    @Body('volunteerType') volunteerType: VolunteerType,
  ): Promise<void> {
    return this.pantriesService.updateVolunteerType(
      assignmentId,
      volunteerType,
    );
  }
}
