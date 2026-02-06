import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Param,
  NotFoundException,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { Donation } from './donations.entity';
import { DonationService } from './donations.service';
import { DonationStatus, RecurrenceEnum } from './types';

@Controller('donations')
export class DonationsController {
  constructor(private donationService: DonationService) {}

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

  @Post('/create')
  @ApiBody({
    description: 'Details for creating a donation',
    schema: {
      type: 'object',
      properties: {
        foodManufacturerId: { type: 'integer', example: 1 },
        dateDonated: {
          type: 'string',
          format: 'date-time',
        },
        status: {
          type: 'string',
          enum: Object.values(DonationStatus),
          example: DonationStatus.AVAILABLE,
        },
        totalItems: { type: 'integer', example: 100 },
        totalOz: { type: 'integer', example: 500 },
        totalEstimatedValue: { type: 'integer', example: 1000 },
        recurrence: {
          type: 'string',
          enum: Object.values(RecurrenceEnum),
          example: RecurrenceEnum.NONE,
        },
        recurrenceFreq: { type: 'integer', example: 1, nullable: true },
        nextDonationDates: {
          type: 'array',
          items: { type: 'string', format: 'date-time' },
          example: ['2024-07-01T00:00:00Z', '2024-08-01T00:00:00Z'],
          nullable: true,
        },
        occurrencesRemaining: { type: 'integer', example: 2, nullable: true },
      },
    },
  })
  async createDonation(
    @Body()
    body: {
      foodManufacturerId: number;
      dateDonated: Date;
      status: DonationStatus;
      totalItems: number;
      totalOz: number;
      totalEstimatedValue: number;
      recurrence: RecurrenceEnum;
      recurrenceFreq?: number;
      nextDonationDates?: Date[];
      occurrencesRemaining?: number;
    },
  ): Promise<Donation> {
    if (
      body.status &&
      !Object.values(DonationStatus).includes(body.status as DonationStatus)
    ) {
      throw new BadRequestException('Invalid status');
    }
    // If we got a recurrence, we should have all of these values
    // The next donation dates should be a list of dates we will get from the frontend accordingly
    if (
      body.recurrence != RecurrenceEnum.NONE &&
      (!body.recurrenceFreq ||
        !body.nextDonationDates ||
        !body.occurrencesRemaining)
    ) {
      throw new BadRequestException('recurrence details are incomplete');
    }
    return this.donationService.create(
      body.foodManufacturerId,
      body.dateDonated,
      body.status ?? DonationStatus.AVAILABLE,
      body.totalItems,
      body.totalOz,
      body.totalEstimatedValue,
      body.recurrence,
      body.recurrenceFreq,
      body.nextDonationDates,
      body.occurrencesRemaining,
    );
  }

  @Patch('/:donationId/fulfill')
  async fulfillDonation(
    @Param('donationId', ParseIntPipe) donationId: number,
  ): Promise<Donation> {
    const updatedDonation = await this.donationService.fulfill(donationId);
    if (!updatedDonation) {
      throw new NotFoundException('Donation not found');
    }
    return updatedDonation;
  }
}
