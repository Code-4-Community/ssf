import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FoodManufacturer } from './manufacturer.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([FoodManufacturer]), AuthModule],
})
export class ManufacturerModule {}
