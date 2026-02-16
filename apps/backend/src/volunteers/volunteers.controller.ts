import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Body,
} from '@nestjs/common';
import { User } from '../users/user.entity';
import { Pantry } from '../pantries/pantries.entity';
import { VolunteersService } from './volunteers.service';

@Controller('volunteers')
export class VolunteersController {
  constructor(private volunteersService: VolunteersService) {}

  @Get('/')
  async getAllVolunteers(): Promise<
    (Omit<User, 'pantries'> & { pantryIds: number[] })[]
  > {
    return this.volunteersService.getVolunteersAndPantryAssignments();
  }

  @Get('/:id')
  async getVolunteer(@Param('id', ParseIntPipe) userId: number): Promise<User> {
    return this.volunteersService.findOne(userId);
  }

  @Get('/:id/pantries')
  async getVolunteerPantries(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Pantry[]> {
    return this.volunteersService.getVolunteerPantries(id);
  }

  @Post('/:id/pantries')
  async assignPantries(
    @Param('id', ParseIntPipe) id: number,
    @Body('pantryIds') pantryIds: number[],
  ): Promise<User> {
    return this.volunteersService.assignPantriesToVolunteer(id, pantryIds);
  }
}
