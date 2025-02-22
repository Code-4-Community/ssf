import { Controller, Get, Post, Param, ParseIntPipe } from '@nestjs/common';
import { OrdersService } from './order.service';
import { Order } from './order.entity';

@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Get('/get-all-orders')
  async getAllOrders(): Promise<Order[]> {
    return this.ordersService.getAll();
  }

  @Get('/:orderId')
  async getOrder(
    @Param('orderId', ParseIntPipe) orderId: number,
  ): Promise<Order> {
    return this.ordersService.findOne(orderId);
  }

  @Post('/update-status/:orderId')
  async updateStatus(
    @Param('orderId', ParseIntPipe) orderId: number,
    newStatus: string,
  ): Promise<void> {
    return this.ordersService.updateStatus(orderId, newStatus);
  }
}
