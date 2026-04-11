import {
  Controller,
  Param,
  Get,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { DonationItemsService } from './donationItems.service';
import { DonationItem } from './donationItems.entity';
import { AuthGuard } from '@nestjs/passport';

@Controller('donation-items')
@UseGuards(AuthGuard('jwt'))
export class DonationItemsController {
  constructor(private donationItemsService: DonationItemsService) {}

  @Get('/:donationId/all')
  async getAllDonationItemsForDonation(
    @Param('donationId', ParseIntPipe) donationId: number,
  ): Promise<DonationItem[]> {
    return this.donationItemsService.getAllDonationItems(donationId);
  }
}
