import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FoodManufacturer } from './manufacturers.entity';
import { FoodManufacturersController } from './manufacturers.controller';
import { FoodManufacturersService } from './manufacturers.service';
import { UsersModule } from '../users/users.module';
import { Donation } from '../donations/donations.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([FoodManufacturer, Donation]),
    forwardRef(() => UsersModule),
  ],
  controllers: [FoodManufacturersController],
  providers: [FoodManufacturersService],
})
export class ManufacturerModule {}
