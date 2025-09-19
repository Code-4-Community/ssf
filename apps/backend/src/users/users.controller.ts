import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Put,
  BadRequestException,
  Body,
  //UseGuards,
  //UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
//import { AuthGuard } from '@nestjs/passport';
import { User } from './user.entity';
import { Role } from './types';
import { VOLUNTEER_ROLES } from './types';
//import { CurrentUserInterceptor } from '../interceptors/current-user.interceptor';

@Controller('users')
//@UseInterceptors(CurrentUserInterceptor)
export class UsersController {
  constructor(private usersService: UsersService) {}

  // @UseGuards(AuthGuard('jwt'))
  @Get('/:userId')
  async getUser(@Param('userId', ParseIntPipe) userId: number): Promise<User> {
    return this.usersService.findOne(userId);
  }

  @Delete('/:id')
  removeUser(@Param('id') id: string) {
    return this.usersService.remove(parseInt(id));
  }

  @Put(':id/role')
  async updateRole(@Param('id') id: number, @Body('role') role: string) {
    if (!Object.values(Role).includes(role as Role)) {
      throw new BadRequestException('Invalid role');
    }
    return this.usersService.update(id, { role: role as Role });
  }

  @Get('/volunteers')
  async getAllVolunteers(): Promise<User[]> {
    return this.usersService.findUsersByRoles(VOLUNTEER_ROLES);
  }
}
