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
import { RecurrenceEnum } from './types';
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
