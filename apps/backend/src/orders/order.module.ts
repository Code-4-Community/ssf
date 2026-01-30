import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersController } from './order.controller';
import { Order } from './order.entity';
import { OrdersService } from './order.service';
import { AllocationModule } from '../allocations/allocations.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order]),
    AllocationModule,
    forwardRef(() => AuthModule),
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
