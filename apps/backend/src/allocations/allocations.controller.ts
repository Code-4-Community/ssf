import { Body, Controller, Post } from '@nestjs/common';
import { AllocationsService } from './allocations.service';
import { Allocation } from './allocations.entity';
import { ApiBody } from '@nestjs/swagger';
import { CreateMultipleAllocationsDto } from './dtos/create-allocations.dto';

@Controller('allocations')
export class AllocationsController {
  constructor(private allocationsService: AllocationsService) {}

  @Post('/create-multiple')
  @ApiBody({
    description:
      'Bulk create allocations given an order id, multiple donation item ids and quantities',
    schema: {
      type: 'object',
      properties: {
        orderId: {
          type: 'integer',
          example: 1,
        },
        itemAllocations: {
          type: 'object',
          description: 'Map of donationItemId -> quantity',
          additionalProperties: {
            type: 'integer',
            example: 10,
          },
          example: {
            '5': 10,
            '8': 3,
            '12': 7,
          },
        },
      },
    },
  })
  async createMultipleAllocations(
    @Body() body: CreateMultipleAllocationsDto,
  ): Promise<Allocation[]> {
    return this.allocationsService.createMultiple(body);
  }
}
