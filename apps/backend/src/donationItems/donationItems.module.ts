import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DonationItemsService } from './donationItems.service';
import { DonationItem } from './donationItems.entity';
import { DonationItemsController } from './donationItems.controller';
import { AuthModule } from '../auth/auth.module';
import { Donation } from '../donations/donations.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([DonationItem, Donation]),
    forwardRef(() => AuthModule),
  ],
  controllers: [DonationItemsController],
  providers: [DonationItemsService],
  exports: [DonationItemsService],
})
export class DonationItemsModule {}
