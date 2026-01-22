import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersController } from './order.controller';
import { Order } from './order.entity';
import { OrdersService } from './order.service';
import { JwtStrategy } from '../auth/jwt.strategy';
import { AuthService } from '../auth/auth.service';
import { AllocationModule } from '../allocations/allocations.module';

@Module({
  imports: [TypeOrmModule.forFeature([Order]), AllocationModule],
  controllers: [OrdersController],
  providers: [OrdersService, AuthService, JwtStrategy],
  exports: [OrdersService],
})
export class OrdersModule {}
