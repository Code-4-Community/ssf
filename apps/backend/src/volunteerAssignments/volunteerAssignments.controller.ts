import { Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { AssignmentsService } from './volunteerAssignments.service';
import { User } from '../users/user.entity';
import { Assignments } from './volunteerAssignments.entity';

@Controller('assignments')
export class AssignmentsController {
  constructor(private pantriesService: AssignmentsService) {}
}
