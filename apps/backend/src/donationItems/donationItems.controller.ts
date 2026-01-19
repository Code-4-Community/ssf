import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  Patch,
  UseGuards,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { DonationItemsService } from './donationItems.service';
import { DonationItem } from './donationItems.entity';
import { AuthGuard } from '@nestjs/passport';
import { FoodType } from './types';

@Controller('donation-items')
//@UseInterceptors()
@UseGuards(AuthGuard('jwt'))
export class DonationItemsController {
  constructor(private donationItemsService: DonationItemsService) {}

  @Get('/get-donation-items/:donationId')
  async getAllDonationIdItems(
    @Param('donationId', ParseIntPipe) donationId: number,
  ): Promise<DonationItem[]> {
    return this.donationItemsService.getAllDonationItems(donationId);
  }

  @Post('/create')
  @ApiBody({
    description: 'Details for creating a donation item',
    schema: {
      type: 'object',
      properties: {
        donationId: { type: 'integer', example: 1 },
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
  })
  async createDonationItem(
    @Body()
    body: {
      donationId: number;
      itemName: string;
      quantity: number;
      reservedQuantity: number;
      ozPerItem: number;
      estimatedValue: number;
      foodType: FoodType;
    },
  ): Promise<DonationItem> {
    if (
      body.foodType &&
      !Object.values(FoodType).includes(body.foodType as FoodType)
    ) {
      throw new BadRequestException('Invalid foodtype');
    }
    return this.donationItemsService.create(
      body.donationId,
      body.itemName,
      body.quantity,
      body.reservedQuantity,
      body.ozPerItem,
      body.estimatedValue,
      body.foodType,
    );
  }

  @Patch('/update-quantity/:itemId')
  async updateDonationItemQuantity(
    @Param('itemId', ParseIntPipe) itemId: number,
  ): Promise<DonationItem> {
    return this.donationItemsService.updateDonationItemQuantity(itemId);
  }
}
