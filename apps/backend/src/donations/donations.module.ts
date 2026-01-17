import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtStrategy } from '../auth/jwt.strategy';
import { AuthService } from '../auth/auth.service';
import { Donation } from './donations.entity';
import { DonationService } from './donations.service';
import { DonationsController } from './donations.controller';
import { ManufacturerModule } from '../foodManufacturers/manufacturers.module';
import { FoodManufacturer } from '../foodManufacturers/manufacturers.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Donation, FoodManufacturer]),
    ManufacturerModule,
  ],
  controllers: [DonationsController],
  providers: [DonationService, AuthService, JwtStrategy],
})
export class DonationModule {}
