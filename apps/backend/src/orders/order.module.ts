import { forwardRef, Module } from '@nestjs/common';
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
import { FoodManufacturer } from '../foodManufacturers/manufacturers.entity';
import { DonationItem } from '../donationItems/donationItems.entity';
import { ManufacturerModule } from '../foodManufacturers/manufacturers.module';
import { DonationItemsModule } from '../donationItems/donationItems.module';
import { Allocation } from '../allocations/allocations.entity';
import { DonationModule } from '../donations/donations.module';
import { Donation } from '../donations/donations.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      Pantry,
      FoodRequest,
      FoodManufacturer,
      DonationItem,
      Allocation,
      Donation,
    ]),
    AllocationModule,
    forwardRef(() => AuthModule),
    AWSS3Module,
    MulterModule.register({ dest: './uploads' }),
    forwardRef(() => RequestsModule),
    ManufacturerModule,
    DonationItemsModule,
    AllocationModule,
    DonationModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
