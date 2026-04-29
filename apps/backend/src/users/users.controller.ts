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
import { userSchemaDto } from './dtos/userSchema.dto';
import { UpdateUserInfoDto } from './dtos/update-user-info.dto';
import { AuthenticatedRequest } from '../auth/authenticated-request';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';
import { AdminVolunteerStats } from './dtos/admin-volunteer-stats.dto';
import { PantryStatsDto } from '../pantries/dtos/pantry-stats.dto';
import { ManufacturerStatsDto } from '../foodManufacturers/dtos/manufacturer-stats.dto';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('/me')
  getCurrentUser(@Req() req: AuthenticatedRequest): Promise<User> {
    return this.usersService.findOne(req.user.id);
  }

  @Get('/:id')
  async getUser(@Param('id', ParseIntPipe) userId: number): Promise<User> {
    return this.usersService.findOne(userId);
  }

  @Get('/:id/stats')
  async getUserDashboardStats(
    @Param('id', ParseIntPipe) userId: number,
  ): Promise<AdminVolunteerStats | PantryStatsDto | ManufacturerStatsDto> {
    return this.usersService.getUserDashboardStats(userId);
  }

  @Delete('/:id')
  removeUser(@Param('id', ParseIntPipe) userId: number): Promise<User> {
    return this.usersService.remove(userId);
  }

  @Patch('/:id')
  async updateInfo(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserInfoDto,
  ): Promise<User> {
    return this.usersService.update(id, dto);
  }

  @Post('/')
  async createUser(@Body() createUserDto: userSchemaDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }
}
