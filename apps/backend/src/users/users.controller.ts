import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Body,
  Patch,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './users.entity';
import { Role } from './types';
import { userSchemaDto } from './dtos/userSchema.dto';
import { updateUserInfo } from './dtos/update-user-info.dto';
import { AuthenticatedRequest } from '../auth/authenticated-request';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('/my-id')
  getCurrentUserId(@Req() req: AuthenticatedRequest): number {
    return req.user.id;
  }

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
