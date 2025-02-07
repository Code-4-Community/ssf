import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtStrategy } from '../auth/jwt.strategy';
import { AuthService } from '../auth/auth.service';
import { Donation } from './donations.entity';
import { DonationService } from './donations.service';
import { DonationItemsModule } from '../donationItems/donationItems.module';
import { DonationsController } from './donations.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Donation]), DonationItemsModule],
  controllers: [DonationsController],
  providers: [DonationService, AuthService, JwtStrategy],
})
export class DonationModule {}
