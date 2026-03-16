import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Donation } from './donations.entity';
import { DonationService } from './donations.service';
import { DonationsController } from './donations.controller';
import { AuthModule } from '../auth/auth.module';
import { FoodManufacturer } from '../foodManufacturers/manufacturers.entity';
import { DonationsSchedulerService } from './donations.scheduler';
import { DonationItem } from '../donationItems/donationItems.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Donation, FoodManufacturer, DonationItem]),
    AuthModule,
  ],
  controllers: [DonationsController],
  providers: [DonationService, DonationsSchedulerService],
})
export class DonationModule {}
