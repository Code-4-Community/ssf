import { forwardRef, Module } from '@nestjs/common';
import { DonationModule } from '../donations/donations.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersController } from './order.controller';
import { Order } from './order.entity';
import { OrdersService } from './order.service';
import { Pantry } from '../pantries/pantries.entity';
import { AllocationModule } from '../allocations/allocations.module';
import { AuthModule } from '../auth/auth.module';
import { FoodRequest } from '../foodRequests/request.entity';
import { AWSS3Module } from '../aws/aws-s3.module';
import { MulterModule } from '@nestjs/platform-express';
import { RequestsModule } from '../foodRequests/request.module';
import { Donation } from '../donations/donations.entity';
import { DonationItem } from '../donationItems/donationItems.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      Pantry,
      FoodRequest,
      Donation,
      DonationItem,
    ]),
    AllocationModule,
    forwardRef(() => AuthModule),
    AWSS3Module,
    MulterModule.register({ dest: './uploads' }),
    forwardRef(() => RequestsModule),
    DonationModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
