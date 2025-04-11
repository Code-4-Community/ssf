import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { AllocationsService } from './allocations.service';
import { Allocation } from './allocations.entity';

@Controller('allocations')
export class AllocationsController {
  constructor(private allocationsService: AllocationsService) {}

  @Get(':orderId/get-all-allocations')
  async getAllAllocationsByOrder(
    @Param('orderId', ParseIntPipe) orderId: number,
  ): Promise<Allocation[] | null> {
    return this.allocationsService.getAllAllocationsByOrder(orderId);
  }
}
