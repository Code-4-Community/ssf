import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Body,
  Req,
} from '@nestjs/common';
import { User } from '../users/users.entity';
import { Pantry } from '../pantries/pantries.entity';
import { VolunteersService } from './volunteers.service';
import { Role } from '../users/types';
import { Roles } from '../auth/roles.decorator';
import { Assignments } from './types';
import { FoodRequest } from '../foodRequests/request.entity';
import { AuthenticatedRequest } from '../auth/authenticated-request';

@Controller('volunteers')
export class VolunteersController {
  constructor(private volunteersService: VolunteersService) {}

  @Roles(Role.ADMIN)
  @Get('/')
  async getAllVolunteers(): Promise<Assignments[]> {
    return this.volunteersService.getVolunteersAndPantryAssignments();
  }

  @Get('/:id/pantries')
  async getVolunteerPantries(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Pantry[]> {
    return this.volunteersService.getVolunteerPantries(id);
  }

  @Get('/:id')
  async getVolunteer(@Param('id', ParseIntPipe) userId: number): Promise<User> {
    return this.volunteersService.findOne(userId);
  }

  @Post('/:id/pantries')
  async assignPantries(
    @Param('id', ParseIntPipe) id: number,
    @Body('pantryIds') pantryIds: number[],
  ): Promise<User> {
    return this.volunteersService.assignPantriesToVolunteer(id, pantryIds);
  }

  @Roles(Role.VOLUNTEER)
  @Get('/me/assigned-requests')
  async getAssignedRequests(
    @Req() req: AuthenticatedRequest,
  ): Promise<FoodRequest[]> {
    const currentUser = req.user;

    return this.volunteersService.findRequestsByVolunteer(currentUser.id);
  }
}
