import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersController } from './order.controller';
import { Order } from './order.entity';
import { OrdersService } from './order.service';
import { AllocationModule } from '../allocations/allocations.module';

@Module({
  imports: [TypeOrmModule.forFeature([Order]), AllocationModule],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
