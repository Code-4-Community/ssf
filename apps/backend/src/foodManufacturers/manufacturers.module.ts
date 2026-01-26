import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FoodManufacturer } from './manufacturers.entity';
import { FoodManufacturersController } from './manufacturers.controller';
import { FoodManufacturersService } from './manufacturers.service';

@Module({
  imports: [TypeOrmModule.forFeature([FoodManufacturer])],
  controllers: [FoodManufacturersController],
  providers: [FoodManufacturersService],
})
export class ManufacturerModule {}
