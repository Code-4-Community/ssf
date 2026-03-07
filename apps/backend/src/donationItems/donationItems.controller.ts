import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  Patch,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { DonationItemsService } from './donationItems.service';
import { DonationItem } from './donationItems.entity';
import { FoodType } from './types';
import { CreateMultipleDonationItemsDto } from './dtos/create-donation-items.dto';

@Controller('donation-items')
//@UseInterceptors()
export class DonationItemsController {
  constructor(private donationItemsService: DonationItemsService) {}

  @Get('/:donationId/all')
  async getAllDonationItemsForDonation(
    @Param('donationId', ParseIntPipe) donationId: number,
  ): Promise<DonationItem[]> {
    return this.donationItemsService.getAllDonationItems(donationId);
  }

  @Post('/create-multiple')
  @ApiBody({
    description: 'Bulk create donation items for a single donation',
    schema: {
      type: 'object',
      properties: {
        donationId: {
          type: 'integer',
          example: 1,
        },
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              itemName: { type: 'string', example: 'Rice Noodles' },
              quantity: { type: 'integer', example: 100 },
              reservedQuantity: { type: 'integer', example: 0 },
              ozPerItem: { type: 'integer', example: 5 },
              estimatedValue: { type: 'integer', example: 100 },
              foodType: {
                type: 'string',
                enum: Object.values(FoodType),
                example: FoodType.DAIRY_FREE_ALTERNATIVES,
              },
            },
          },
        },
      },
    },
  })
  async createMultipleDonationItems(
    @Body() body: CreateMultipleDonationItemsDto,
  ): Promise<DonationItem[]> {
    return this.donationItemsService.createMultipleDonationItems(
      body.donationId,
      body.items,
    );
  }

  @Patch('/update-quantity/:itemId')
  async updateDonationItemQuantity(
    @Param('itemId', ParseIntPipe) itemId: number,
  ): Promise<DonationItem> {
    return this.donationItemsService.updateDonationItemQuantity(itemId);
  }
}
