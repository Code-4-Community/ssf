import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FoodManufacturer } from './manufacturer.entity';
import { ManufacturerController } from './manufacturer.controller';
import { ManufacturerService } from './manufacturer.service';
import { JwtStrategy } from '../auth/jwt.strategy';
import { AuthService } from '../auth/auth.service';

@Module({
  imports: [TypeOrmModule.forFeature([FoodManufacturer])],
  controllers: [ManufacturerController],
  providers: [ManufacturerService, AuthService, JwtStrategy],
})
export class ManufacturerModule {}
