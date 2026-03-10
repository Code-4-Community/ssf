import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Donation } from './donations.entity';
import { DonationService } from './donations.service';
import { DonationsController } from './donations.controller';
import { AuthModule } from '../auth/auth.module';
import { FoodManufacturer } from '../foodManufacturers/manufacturers.entity';
import { DonationsSchedulerService } from './donations.scheduler';

@Module({
  imports: [
    TypeOrmModule.forFeature([Donation, FoodManufacturer]),
    forwardRef(() => AuthModule),
  ],
  controllers: [DonationsController],
  providers: [DonationService, DonationsSchedulerService],
  exports: [DonationService],
})
export class DonationModule {}
