import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Put,
  Post,
  BadRequestException,
  Body,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { Role } from './types';
import { userSchemaDto } from './dtos/userSchema.dto';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('/:id')
  async getUser(@Param('id', ParseIntPipe) userId: number): Promise<User> {
    return this.usersService.findOne(userId);
  }

  @Delete('/:id')
  removeUser(@Param('id', ParseIntPipe) userId: number): Promise<User> {
    return this.usersService.remove(userId);
  }

  @Put('/:id/role')
  async updateRole(
    @Param('id', ParseIntPipe) id: number,
    @Body('role') role: string,
  ): Promise<User> {
    if (!Object.values(Role).includes(role as Role)) {
      throw new BadRequestException('Invalid role');
    }
    return this.usersService.update(id, { role: role as Role });
  }

  @Post('/')
  async createUser(@Body() createUserDto: userSchemaDto): Promise<User> {
    const { email, firstName, lastName, phone, role } = createUserDto;
    return this.usersService.create(email, firstName, lastName, phone, role);
  }
}
