import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
<<<<<<< HEAD
import { FoodManufacturer } from './manufacturer.entity';
=======
import { FoodManufacturer } from './manufacturers.entity';
>>>>>>> main
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([FoodManufacturer]), AuthModule],
})
export class ManufacturerModule {}
