import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtStrategy } from '../auth/jwt.strategy';
import { AuthService } from '../auth/auth.service';
import { Donation } from './donations.entity';
import { DonationService } from './donations.service';
import { DonationsController } from './donations.controller';
import { ManufacturerModule } from '../foodManufacturers/manufacturer.module';

@Module({
  imports: [TypeOrmModule.forFeature([Donation]), ManufacturerModule],
  controllers: [DonationsController],
  providers: [DonationService, AuthService, JwtStrategy],
})
export class DonationModule {}
