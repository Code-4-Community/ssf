import {
  Controller,
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
import { PendingApplication, Role } from './types';
import { AuthenticatedRequest } from '../auth/authenticated-request';
import { AdminVolunteerStats } from './dtos/admin-volunteer-stats.dto';
import { PantryStatsDto } from '../pantries/dtos/pantry-stats.dto';
import { ManufacturerStatsDto } from '../foodManufacturers/dtos/manufacturer-stats.dto';
import { Roles } from '../auth/roles.decorator';
import { CheckOwnership, OwnerIdResolver } from '../auth/ownership.decorator';

const resolveUserAuthorizedUserIds: OwnerIdResolver = async ({ entityId }) => [
  entityId,
];

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('/me')
  getCurrentUser(@Req() req: AuthenticatedRequest): Promise<User> {
    return this.usersService.findOne(req.user.id);
  }

  @CheckOwnership({
    idParam: 'id',
    resolver: resolveUserAuthorizedUserIds,
  })
  @Get('/:id/stats')
  async getUserDashboardStats(
    @Param('id', ParseIntPipe) userId: number,
  ): Promise<AdminVolunteerStats | PantryStatsDto | ManufacturerStatsDto> {
    return this.usersService.getUserDashboardStats(userId);
  }

  @Roles(Role.ADMIN)
  @Get('/admin/recent-pending-applications')
  async getRecentPendingApplications(): Promise<PendingApplication[]> {
    return this.usersService.getRecentPendingApplications();
  }

  @Roles(Role.ADMIN)
  @Delete('/:id')
  async removeUser(@Param('id', ParseIntPipe) userId: number): Promise<User> {
    return this.usersService.remove(userId);
  }

  @CheckOwnership({
    idParam: 'id',
    resolver: resolveUserAuthorizedUserIds,
  })
  @Patch('/:id')
  async updateInfo(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserInfoDto,
  ): Promise<User> {
    return this.usersService.update(id, dto);
  }

  @Roles(Role.ADMIN)
  @Patch('/:id/deactivate')
  async deactivateUser(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return this.usersService.deactivate(id);
  }

  @Roles(Role.ADMIN)
  @Patch('/:id/reactivate')
  async reactivateUser(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return this.usersService.reactivate(id);
  }

  @Post('/')
  async createUser(@Body() createUserDto: userSchemaDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }
}
