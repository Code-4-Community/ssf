import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Param,
  NotFoundException,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { Donation } from './donations.entity';
import { DonationService } from './donations.service';
import { DonationStatus, RecurrenceEnum } from './types';
import { CreateDonationDto } from './dtos/create-donation.dto';

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
        totalOz: { type: 'number', example: 100.5 },
        totalEstimatedValue: { type: 'number', example: 100.5 },
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
    body: CreateDonationDto,
  ): Promise<Donation> {
    return this.donationService.create(body);
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
