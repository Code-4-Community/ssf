import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Donation } from './donations.entity';
import { DonationService } from './donations.service';
import { DonationsController } from './donations.controller';
import { ManufacturerModule } from '../foodManufacturers/manufacturer.module';
import { AuthModule } from '../auth/auth.module';
import { FoodManufacturer } from '../foodManufacturers/manufacturer.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Donation, FoodManufacturer]),
    ManufacturerModule,
    AuthModule,
  ],
  controllers: [DonationsController],
  providers: [DonationService],
})
export class DonationModule {}
