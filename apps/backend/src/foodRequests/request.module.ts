import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequestsController } from './request.controller';
import { FoodRequest } from './request.entity';
import { RequestsService } from './request.service';
import { JwtStrategy } from '../auth/jwt.strategy';
import { AuthService } from '../auth/auth.service';
import { Order } from '../orders/order.entity';
import { Pantry } from '../pantries/pantries.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FoodRequest, Order, Pantry])],
  controllers: [RequestsController],
  providers: [RequestsService, AuthService, JwtStrategy],
})
export class RequestsModule {}
