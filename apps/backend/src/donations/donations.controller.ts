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
import { ReplaceDonationItemsDto } from '../donationItems/dtos/create-donation-items.dto';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../users/types';
import {
  CheckOwnership,
  OwnerIdResolver,
  pipeNullable,
} from '../auth/ownership.decorator';

const resolveDonationAuthorizedUserIds: OwnerIdResolver = ({
  entityId,
  services,
}) =>
  pipeNullable(
    () => services.get(DonationService).findOne(entityId),
    (donation: Donation) => [
      donation.foodManufacturer.foodManufacturerRepresentative.id,
    ],
  );

@Controller('donations')
export class DonationsController {
  constructor(private donationService: DonationService) {}

  @Roles(Role.ADMIN)
  @Get()
  async getAllDonations(): Promise<Donation[]> {
    return this.donationService.getAll();
  }

  @Get('/count')
  async getNumberOfDonations(): Promise<number> {
    return this.donationService.getNumberOfDonations();
  }

  @Get('/:donationId')
  async getDonation(
    @Param('donationId', ParseIntPipe) donationId: number,
  ): Promise<Donation> {
    return this.donationService.findOne(donationId);
  }

  @Roles(Role.FOODMANUFACTURER)
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

  @Roles(Role.FOODMANUFACTURER)
  @CheckOwnership({
    idParam: 'donationId',
    resolver: resolveDonationAuthorizedUserIds,
  })
  @Patch('/:donationId/item-details')
  async updateDonationItemDetails(
    @Param('donationId', ParseIntPipe) donationId: number,
    @Body(new ParseArrayPipe({ items: UpdateDonationItemDetailsDto }))
    body: UpdateDonationItemDetailsDto[],
  ): Promise<void> {
    await this.donationService.updateDonationItemDetails(donationId, body);
  }

  @Put('/:donationId/items')
  async replaceDonationItems(
    @Param('donationId', ParseIntPipe) donationId: number,
    @Body() body: ReplaceDonationItemsDto,
  ): Promise<void> {
    await this.donationService.replaceDonationItems(donationId, body);
  }

  @Roles(Role.FOODMANUFACTURER)
  @CheckOwnership({
    idParam: 'donationId',
    resolver: resolveDonationAuthorizedUserIds,
  })
  @Roles(Role.FOODMANUFACTURER)
  @Delete('/:donationId')
  async deleteDonation(
    @Param('donationId', ParseIntPipe) donationId: number,
  ): Promise<void> {
    return this.donationService.delete(donationId);
  }
}
