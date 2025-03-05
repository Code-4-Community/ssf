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
  constructor(private assignmentsService: AssignmentsService) {}

  @Get('/getAllRelations')
  async getAllRelations(): Promise<Assignments[]> {
    return this.assignmentsService.findAllRelations();
  }

  @Put('/updateVolunteerType/:userId')
  async updateVolunteerType(
    @Param('userId', ParseIntPipe) userId: number,
    @Body('volunteerType') volunteerType: VolunteerType,
  ): Promise<void> {
    return this.assignmentsService.updateVolunteerType(userId, volunteerType);
  }
}
