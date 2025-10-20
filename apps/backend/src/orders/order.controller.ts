import {
  Controller,
  Get,
  Patch,
  Param,
  ParseIntPipe,
  Body,
} from '@nestjs/common';
import { OrdersService } from './order.service';
import { Order } from './order.entity';
import { Pantry } from '../pantries/pantries.entity';
import { FoodManufacturer } from '../foodManufacturers/manufacturer.entity';
import { FoodRequest } from '../foodRequests/request.entity';
import { Donation } from '../donations/donations.entity';

@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Get('/get-all-orders')
  async getAllOrders(): Promise<Order[]> {
    return this.ordersService.getAll();
  }

  @Get('/get-current-orders')
  async getCurrentOrders(): Promise<Order[]> {
    return this.ordersService.getCurrentOrders();
  }

  @Get('/get-past-orders')
  async getPastOrders(): Promise<Order[]> {
    return this.ordersService.getPastOrders();
  }

  @Get(':orderId/pantry')
  async getPantryFromOrder(
    @Param('orderId', ParseIntPipe) orderId: number,
  ): Promise<Pantry> {
    return this.ordersService.findOrderPantry(orderId);
  }

  @Get(':orderId/request')
  async getRequestFromOrder(
    @Param('orderId', ParseIntPipe) orderId: number,
  ): Promise<FoodRequest> {
    return this.ordersService.findOrderFoodRequest(orderId);
  }

  @Get(':orderId/manufacturer')
  async getManufacturerFromOrder(
    @Param('orderId', ParseIntPipe) orderId: number,
  ): Promise<FoodManufacturer> {
    return this.ordersService.findOrderFoodManufacturer(orderId);
  }

  @Get(':orderId/donation')
  async getDonationFromOrder(
    @Param('orderId', ParseIntPipe) orderId: number,
  ): Promise<Donation> {
    return this.ordersService.findOrderDonation(orderId);
  }

  @Get('/:orderId')
  async getOrder(
    @Param('orderId', ParseIntPipe) orderId: number,
  ): Promise<Order> {
    return this.ordersService.findOne(orderId);
  }

  @Get('/order/:requestId')
  async getOrderByRequestId(
    @Param('requestId', ParseIntPipe) requestId: number,
  ): Promise<Order> {
    return this.ordersService.findOrderByRequest(requestId);
  }

  @Patch('/update-status/:orderId')
  async updateStatus(
    @Param('orderId', ParseIntPipe) orderId: number,
    @Body('newStatus') newStatus: string,
  ): Promise<void> {
    return this.ordersService.updateStatus(orderId, newStatus);
  }
}
