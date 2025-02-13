import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FoodManufacturer } from './manufacturer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FoodManufacturer])],
})
export class ManufacturerModule {}
