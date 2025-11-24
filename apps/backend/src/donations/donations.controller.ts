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
import { DonationStatus } from './types';

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
          example: DonationStatus.AVAILABLE 
        },
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
      status: DonationStatus;
      totalItems: number;
      totalOz: number;
      totalEstimatedValue: number;
    },
  ): Promise<Donation> {
    if (
      body.status &&
      !Object.values(DonationStatus).includes(body.status as DonationStatus)
    ) {
      throw new BadRequestException('Invalid status');
    }
    return this.donationService.create(
      body.foodManufacturerId,
      body.dateDonated,
      body.status ?? DonationStatus.AVAILABLE,
      body.totalItems,
      body.totalOz,
      body.totalEstimatedValue,
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
