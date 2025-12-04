import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  ParseIntPipe,
  Body,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { OrdersService } from './order.service';
import { Order } from './order.entity';
import { Pantry } from '../pantries/pantries.entity';
import { FoodManufacturer } from '../foodManufacturers/manufacturer.entity';
import { FoodRequest } from '../foodRequests/request.entity';
import { AllocationsService } from '../allocations/allocations.service';
import { OrderStatus } from './types';
import { Donation } from '../donations/donations.entity';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly allocationsService: AllocationsService,
  ) {}

  // Called like: /?status=pending&pantryName=Test%20Pantry&pantryName=Test%20Pantry%202
  // %20 is the URL encoded space character
  // This gets all pantries with the name Test Pantry or Test Pantry 2 that have a pending status
  @Get('/')
  async getAllOrders(
    @Query('status') status?: string,
    @Query('pantryName') pantryNames?: string | string[],
  ): Promise<Order[]> {
    if (typeof pantryNames === 'string') {
      pantryNames = [pantryNames];
    }
    return this.ordersService.getAll({ status, pantryNames });
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
  ): Promise<Pantry | null> {
    return this.ordersService.findOrderPantry(orderId);
  }

  @Get(':orderId/request')
  async getRequestFromOrder(
    @Param('orderId', ParseIntPipe) orderId: number,
  ): Promise<FoodRequest | null> {
    return this.ordersService.findOrderFoodRequest(orderId);
  }

  @Get(':orderId/manufacturer')
  async getManufacturerFromOrder(
    @Param('orderId', ParseIntPipe) orderId: number,
  ): Promise<FoodManufacturer | null> {
    return this.ordersService.findOrderFoodManufacturer(orderId);
  }

  // @Get(':orderId/donation')
  // async getDonationFromOrder(
  //   @Param('orderId', ParseIntPipe) orderId: number,
  // ): Promise<Donation | null> {
  //   return this.ordersService.findOrderDonation(orderId);
  // }

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

  @Get(':orderId/allocations')
  async getAllAllocationsByOrder(
    @Param('orderId', ParseIntPipe) orderId: number,
  ) {
    return this.allocationsService.getAllAllocationsByOrder(orderId);
  }

  @Patch('/update-status/:orderId')
  async updateStatus(
    @Param('orderId', ParseIntPipe) orderId: number,
    @Body('newStatus') newStatus: string,
  ): Promise<void> {
    if (!Object.values(OrderStatus).includes(newStatus as OrderStatus)) {
      throw new BadRequestException('Invalid status');
    }
    return this.ordersService.updateStatus(orderId, newStatus as OrderStatus);
  }
}
