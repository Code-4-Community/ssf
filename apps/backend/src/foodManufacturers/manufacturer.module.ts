import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
// import { JwtStrategy } from '../auth/jwt.strategy';
// import { AuthService } from '../auth/auth.service';
import { FoodManufacturer } from './manufacturer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FoodManufacturer])],
  // controllers: [DonationsController],
  // providers: [DonationService, AuthService, JwtStrategy],
})
export class ManufacturerModule {}
