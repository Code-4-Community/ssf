import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Param,
  NotFoundException,
} from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { Donation } from './donations.entity';
import { DonationService } from './donations.service';

@Controller('donations')
export class DonationsController {
  constructor(private donationService: DonationService) {}

  @Get('/get-all-donations')
  async getAllDonations(): Promise<Donation[]> {
    return this.donationService.getAll();
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
        status: { type: 'string', example: 'in progress' },
        totalItems: { type: 'integer', example: 100 },
        totalOz: { type: 'integer', example: 500 },
        totalEstimatedValue: { type: 'integer', example: 1000 },
      },
    },
  })
  async createDonation(
    @Body()
    body: {
      foodManufacturerId: number;
      dateDonated: Date;
      status: string;
      totalItems: number;
      totalOz: number;
      totalEstimatedValue: number;
    },
  ): Promise<Donation> {
    return this.donationService.create(
      body.foodManufacturerId,
      body.dateDonated,
      body.status,
      body.totalItems,
      body.totalOz,
      body.totalEstimatedValue,
    );
  }

  @Patch('/:donationId/fulfill')
  async fulfillDonation(
    @Param('donationId') donationId: number,
  ): Promise<Donation> {
    const updatedDonation = await this.donationService.fulfill(donationId);
    if (!updatedDonation) {
      throw new NotFoundException('Donation not found');
    }
    return updatedDonation;
  }
}
