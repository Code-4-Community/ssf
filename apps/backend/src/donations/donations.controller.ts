import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Param,
  ParseIntPipe,
  ParseArrayPipe,
  Put,
  Delete,
} from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { Donation } from './donations.entity';
import { DonationService } from './donations.service';
import { RecurrenceEnum } from './types';
import { CreateDonationDto } from './dtos/create-donation.dto';
import { UpdateDonationItemDetailsDto } from '../donationItems/dtos/update-donation-item-details.dto';
import { FoodType } from '../donationItems/types';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../users/types';
import { CheckOwnership, pipeNullable } from '../auth/ownership.decorator';
import { FoodManufacturersService } from '../foodManufacturers/manufacturers.service';
import { FoodManufacturer } from '../foodManufacturers/manufacturers.entity';

@Controller('donations')
export class DonationsController {
  constructor(private donationService: DonationService) {}

  @Post()
  @ApiBody({
    description: 'Details for creating a donation',
    schema: {
      type: 'object',
      properties: {
        foodManufacturerId: { type: 'integer', example: 1 },
        recurrence: {
          type: 'string',
          enum: Object.values(RecurrenceEnum),
          example: RecurrenceEnum.NONE,
        },
        recurrenceFreq: { type: 'integer', example: 1, nullable: true },
        repeatOnDays: {
          type: 'object',
          nullable: true,
          properties: {
            Sunday: { type: 'boolean', example: false },
            Monday: { type: 'boolean', example: true },
            Tuesday: { type: 'boolean', example: false },
            Wednesday: { type: 'boolean', example: false },
            Thursday: { type: 'boolean', example: false },
            Friday: { type: 'boolean', example: false },
            Saturday: { type: 'boolean', example: false },
          },
        },
        occurrencesRemaining: { type: 'integer', example: 2, nullable: true },
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              itemName: { type: 'string', example: 'Canned Beans' },
              quantity: { type: 'integer', example: 1 },
              ozPerItem: { type: 'number', example: 0.01, nullable: true },
              estimatedValue: { type: 'number', example: 0.01, nullable: true },
              foodType: {
                type: 'enum',
                enum: Object.values(FoodType),
                example: FoodType.QUINOA,
              },
              foodRescue: { type: 'boolean', example: false },
            },
          },
        },
      },
    },
  })
  async createDonation(
    @Body()
    body: CreateDonationDto,
  ): Promise<Donation> {
    return this.donationService.create(body);
  }

  @Patch('/:donationId/fulfill')
  async fulfillDonation(
    @Param('donationId', ParseIntPipe) donationId: number,
  ): Promise<void> {
    await this.donationService.fulfill(donationId);
  }

  @Roles(Role.ADMIN, Role.FOODMANUFACTURER)
  @CheckOwnership({
    idParam: 'donationId',
    resolver: async ({ entityId, services }) => {
      return pipeNullable(
        () => services.get(DonationService).findOne(entityId),
        (donation: Donation) =>
          services
            .get(FoodManufacturersService)
            .findOne(donation.foodManufacturer.foodManufacturerId),
        (manufacturer: FoodManufacturer) => [
          manufacturer.foodManufacturerRepresentative.id,
        ],
      );
    },
  })
  @Patch('/:donationId/item-details')
  async updateDonationItemDetails(
    @Param('donationId', ParseIntPipe) donationId: number,
    @Body(new ParseArrayPipe({ items: UpdateDonationItemDetailsDto }))
    body: UpdateDonationItemDetailsDto[],
  ): Promise<void> {
    await this.donationService.updateDonationItemDetails(donationId, body);
  }
}
