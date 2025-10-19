import { Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { Pantry } from './pantries.entity';
import { PantriesService } from './pantries.service';
import { User } from '../users/user.entity';
import { Order } from '../orders/order.entity';
import { OrdersService } from '../orders/order.service';

@Controller('pantries')
export class PantriesController {
  constructor(
    private pantriesService: PantriesService,
    private ordersService: OrdersService,
  ) {}

  @Get('/pending')
  async getPendingPantries(): Promise<Pantry[]> {
    return this.pantriesService.getPendingPantries();
  }

  @Get('/:pantryId/ssf-contact')
  async getSSFRep(
    @Param('pantryId', ParseIntPipe) pantryId: number,
  ): Promise<User> {
    return this.pantriesService.findSSFRep(pantryId);
  }

  @Get('/:pantryId')
  async getPantry(
    @Param('pantryId', ParseIntPipe) pantryId: number,
  ): Promise<Pantry> {
    return this.pantriesService.findOne(pantryId);
  }

  @Get('/orders/:pantryId')
  async getOrders(
    @Param('pantryId', ParseIntPipe) pantryId: number,
  ): Promise<Order[]> {
    return this.ordersService.getOrdersByPantry(pantryId);
  }

  @Post('/approve/:pantryId')
  async approvePantry(
    @Param('pantryId', ParseIntPipe) pantryId: number,
  ): Promise<void> {
    return this.pantriesService.approve(pantryId);
  }

  @Post('/deny/:pantryId')
  async denyPantry(
    @Param('pantryId', ParseIntPipe) pantryId: number,
  ): Promise<void> {
    return this.pantriesService.deny(pantryId);
  }
}
