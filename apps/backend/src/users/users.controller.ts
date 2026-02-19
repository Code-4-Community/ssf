import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Put,
  Post,
  Body,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { userSchemaDto } from './dtos/userSchema.dto';
import { updateUserInfo } from './dtos/updateUserInfo.dto';
import { Pantry } from '../pantries/pantries.entity';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('/volunteers')
  async getAllVolunteers(): Promise<
    (Omit<User, 'pantries'> & { pantryIds: number[] })[]
  > {
    return this.usersService.getVolunteersAndPantryAssignments();
  }

  @Get('/:id')
  async getUser(@Param('id', ParseIntPipe) userId: number): Promise<User> {
    return this.usersService.findOne(userId);
  }

  @Get('/:id/pantries')
  async getVolunteerPantries(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Pantry[]> {
    return this.usersService.getVolunteerPantries(id);
  }

  @Delete('/:id')
  removeUser(@Param('id', ParseIntPipe) userId: number): Promise<User> {
    return this.usersService.remove(userId);
  }

  @Put(':id/info')
  async updateInfo(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: updateUserInfo,
  ): Promise<User> {
    return this.usersService.update(id, dto);
  }

  @Post('/')
  async createUser(@Body() createUserDto: userSchemaDto): Promise<User> {
    const { email, firstName, lastName, phone, role } = createUserDto;
    return this.usersService.create(email, firstName, lastName, phone, role);
  }

  @Post('/:id/pantries')
  async assignPantries(
    @Param('id', ParseIntPipe) id: number,
    @Body('pantryIds') pantryIds: number[],
  ): Promise<User> {
    return this.usersService.assignPantriesToVolunteer(id, pantryIds);
  }
}
