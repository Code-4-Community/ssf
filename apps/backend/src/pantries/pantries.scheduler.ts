import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PantriesService } from './pantries.service';

@Injectable()
export class PantriesSchedulerService {
  private readonly logger = new Logger(PantriesSchedulerService.name);

  constructor(private readonly pantriesService: PantriesService) {}

  // cron pattern fields in order: second, minute, hour, day of month, month, day of week
  // '0 0 12 1 * *' => 12 PM on the 1st of every month
  @Cron('0 0 12 1 * *', { timeZone: 'America/New_York' }) // Runs at noon Eastern on the 1st of every month
  async handleMonthlyFoodRequestReminder() {
    this.logger.log('Running monthly pantry food request reminder cron job');
    await this.pantriesService.sendFoodRequestReminderToApprovedPantries();
  }
}
