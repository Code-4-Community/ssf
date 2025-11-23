import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { PantriesService } from './pantries.service';
import { PantriesController } from './pantries.controller';
import { JwtStrategy } from '../auth/jwt.strategy';
import { AuthService } from '../auth/auth.service';
import { Pantry } from './pantries.entity';
import { OrdersService } from '../orders/order.service';
import { Order } from '../orders/order.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Pantry, User, Order])],
  controllers: [PantriesController],
  providers: [PantriesService, AuthService, JwtStrategy, OrdersService],
})
export class PantriesModule {}
