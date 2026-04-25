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
import { Assignments, VolunteerOrder } from './types';
import { FoodRequest } from '../foodRequests/request.entity';
import { AuthenticatedRequest } from '../auth/authenticated-request';
import { OrdersService } from '../orders/order.service';
import { CheckOwnership, pipeNullable } from '../auth/ownership.decorator';
import { UsersService } from '../users/users.service';

@Controller('volunteers')
export class VolunteersController {
  constructor(
    private volunteersService: VolunteersService,
    private ordersService: OrdersService,
  ) {}

  @Roles(Role.ADMIN)
  @Get('/')
  async getAllVolunteers(): Promise<Assignments[]> {
    return this.volunteersService.getVolunteersAndPantryAssignments();
  }

  @Roles(Role.VOLUNTEER, Role.ADMIN)
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

  @CheckOwnership({
    idParam: 'id',
    resolver: async ({ entityId, services }) => {
      return pipeNullable(
        () => services.get(UsersService).findOne(entityId),
        (user: User) => [user.id],
      );
    },
    bypassRoles: [Role.ADMIN],
  })
  @Roles(Role.VOLUNTEER, Role.ADMIN)
  @Get('/:id/my-recent-orders')
  async getRecentOrders(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<VolunteerOrder[]> {
    return this.volunteersService.getRecentOrders(id);
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

  // returns all orders globally
  // only includes actionCompletion for orders assigned to the requesting volunteer
  @Roles(Role.VOLUNTEER)
  @Get('/:id/orders')
  async getVolunteerOrders(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<VolunteerOrder[]> {
    return this.ordersService.getAllOrdersForVolunteer(id);
  }
}
