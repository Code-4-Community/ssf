import { Injectable, Logger } from '@nestjs/common';
import { DonationService } from './donations.service';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class DonationsSchedulerService {
  private readonly logger = new Logger(DonationsSchedulerService.name);

  constructor(private readonly donationService: DonationService) {}

  // cron pattern:
  // supported: *, ranges/#'s (e.g. 1-3, 5), steps (e.g. */2)
  //    * indicates the method should be run every _ unit of time
  //    range/# indicates method should be run on the _ unit of time/between the _ and _ unit of time
  //    step indicates the method should be run every _ unit of time
  // fields in order: second, minute, hour, day of month, month, day of week
  @Cron('0 30 10 * * *') // Runs every day at 10:30 AM
  async handleDailyRecurringDonations() {
    this.logger.log('Running daily donation reminder cron job');
    await this.donationService.handleRecurringDonations();
  }
}
