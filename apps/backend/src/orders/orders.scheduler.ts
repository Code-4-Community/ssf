import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { OrdersService } from './order.service';

@Injectable()
export class OrdersSchedulerService {
  private readonly logger = new Logger(OrdersSchedulerService.name);

  constructor(private readonly ordersService: OrdersService) {}

  // 12 PM on every Monday
  @Cron('0 0 12 * * 1', { timeZone: 'America/New_York' })
  async handleWeeklyConfirmDeliveryReminder() {
    this.logger.log('Running weekly confirm-delivery reminder cron job');
    await this.ordersService.sendConfirmDeliveryReminders();
  }
}
