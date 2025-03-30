import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DonationItemsService } from './donationItems.service';
import { DonationItem } from './donationItems.entity';
import { DonationItemsController } from './donationItems.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([DonationItem]), AuthModule],
  controllers: [DonationItemsController],
  providers: [DonationItemsService],
})
export class DonationItemsModule {}
