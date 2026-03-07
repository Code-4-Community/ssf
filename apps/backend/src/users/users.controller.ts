import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Body,
  Patch,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { userSchemaDto } from './dtos/userSchema.dto';
import { updateUserInfo } from './dtos/update-user-info.dto';

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

  @Patch('/:id')
  async updateInfo(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: updateUserInfo,
  ): Promise<User> {
    return this.usersService.update(id, dto);
  }

  @Post('/')
  async createUser(@Body() createUserDto: userSchemaDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }
}
