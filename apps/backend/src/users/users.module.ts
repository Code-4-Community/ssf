import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './users.entity';
import { PantriesModule } from '../pantries/pantries.module';
import { AuthModule } from '../auth/auth.module';
import { EmailsModule } from '../emails/email.module';
import { FoodRequest } from '../foodRequests/request.entity';
import { Order } from '../orders/order.entity';
import { Donation } from '../donations/donations.entity';
import { ManufacturerModule } from '../foodManufacturers/manufacturers.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, FoodRequest, Order, Donation]),
    forwardRef(() => PantriesModule),
    forwardRef(() => AuthModule),
    forwardRef(() => ManufacturerModule),
    EmailsModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
