import { Injectable, Logger } from '@nestjs/common';
import { DonationService } from './donations.service';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class DonationsSchedulerService {
  private readonly logger = new Logger(DonationsSchedulerService.name);

  constructor(private readonly donationService: DonationService) {}

  @Cron('0 9 * * *') // Runs every day at 9 AM
  async handleDailyRecurringDonations() {
    this.logger.log('Running daily donation reminder cron job');
    await this.donationService.handleRecurringDonations();
  }
}
