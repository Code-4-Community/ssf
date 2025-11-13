import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DonationItemsService } from './donationItems.service';
import { DonationItem } from './donationItems.entity';
import { JwtStrategy } from '../auth/jwt.strategy';
import { AuthService } from '../auth/auth.service';
import { DonationItemsController } from './donationItems.controller';
import { Donation } from '../donations/donations.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DonationItem, Donation])],
  controllers: [DonationItemsController],
  providers: [DonationItemsService, AuthService, JwtStrategy],
})
export class DonationItemsModule {}
