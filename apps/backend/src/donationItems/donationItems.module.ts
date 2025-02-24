import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DonationItemsService } from './donationItems.service';
import { DonationItem } from './donationItems.entity';
import { JwtStrategy } from '../auth/jwt.strategy';
import { AuthService } from '../auth/auth.service';
import { DonationItemsController } from './donationItems.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DonationItem])],
  controllers: [DonationItemsController],
  providers: [DonationItemsService, AuthService, JwtStrategy],
})
export class DonationItemsModule {}
