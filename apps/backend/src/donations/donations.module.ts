import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Donation } from './donations.entity';
import { DonationService } from './donations.service';
import { DonationsController } from './donations.controller';
import { AuthModule } from '../auth/auth.module';
import { FoodManufacturer } from '../foodManufacturers/manufacturers.entity';
import { DonationsSchedulerService } from './donations.scheduler';
import { DonationItem } from '../donationItems/donationItems.entity';
import { DonationItemsModule } from '../donationItems/donationItems.module';
import { Allocation } from '../allocations/allocations.entity';
import { AllocationModule } from '../allocations/allocations.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Donation,
      FoodManufacturer,
      DonationItem,
      Allocation,
    ]),
    forwardRef(() => AuthModule),
    DonationItemsModule,
    AllocationModule,
  ],
  controllers: [DonationsController],
  providers: [DonationService, DonationsSchedulerService],
  exports: [DonationService],
})
export class DonationModule {}
