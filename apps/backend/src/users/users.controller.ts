import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Put,
  Patch,
  BadRequestException,
  Body,
  //UseGuards,
  //UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
//import { AuthGuard } from '@nestjs/passport';
import { User } from './user.entity';
import { Role } from './types';
//import { CurrentUserInterceptor } from '../interceptors/current-user.interceptor';

@Controller('users')
//@UseInterceptors(CurrentUserInterceptor)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('/volunteers')
  async getAllVolunteers(): Promise<User[]> {
    return this.usersService.getVolunteersAndPantryAssignments();
  }

  // @UseGuards(AuthGuard('jwt'))
  @Get('/:id')
  async getUser(@Param('id', ParseIntPipe) userId: number): Promise<User> {
    return this.usersService.findOne(userId);
  }

  @Delete('/:id')
  removeUser(@Param('id', ParseIntPipe) userId: number) {
    return this.usersService.remove(userId);
  }

  @Put(':id/role')
  async updateRole(
    @Param('id', ParseIntPipe) id: number,
    @Body('role') role: string,
  ) {
    if (!Object.values(Role).includes(role as Role)) {
      throw new BadRequestException('Invalid role');
    }
    return this.usersService.update(id, { role: role as Role });
  }

  @Get('/:id/pantries')
  async getVolunteerPantries(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.getVolunteerPantries(id);
  }

  @Patch(':id/pantries')
  async assignPantry(
    @Param('id', ParseIntPipe) id: number,
    @Body('pantryIds') pantryIds: number[],
  ) {
    return this.usersService.assignPantriesToVolunteer(id, pantryIds);
  }
}
