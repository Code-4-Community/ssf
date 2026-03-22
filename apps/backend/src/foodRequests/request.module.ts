import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequestsController } from './request.controller';
import { FoodRequest } from './request.entity';
import { RequestsService } from './request.service';
import { AuthModule } from '../auth/auth.module';
import { Order } from '../orders/order.entity';
import { Pantry } from '../pantries/pantries.entity';
import { FoodManufacturer } from '../foodManufacturers/manufacturers.entity';
import { DonationItem } from '../donationItems/donationItems.entity';
import { EmailsModule } from '../emails/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FoodRequest,
      Order,
      Pantry,
      FoodManufacturer,
      DonationItem,
    ]),
    AuthModule,
    EmailsModule,
  ],
  controllers: [RequestsController],
  providers: [RequestsService],
  exports: [RequestsService],
})
export class RequestsModule {}
