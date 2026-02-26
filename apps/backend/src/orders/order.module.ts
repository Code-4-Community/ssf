import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersController } from './order.controller';
import { Order } from './order.entity';
import { OrdersService } from './order.service';
import { Pantry } from '../pantries/pantries.entity';
import { AllocationModule } from '../allocations/allocations.module';
import { AuthModule } from '../auth/auth.module';
import { FoodRequest } from '../foodRequests/request.entity';
import { AWSS3Module } from '../aws/aws-s3.module';
import { MulterModule } from '@nestjs/platform-express';
import { RequestsModule } from '../foodRequests/request.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, Pantry, FoodRequest]),
    AllocationModule,
    forwardRef(() => AuthModule),
    AWSS3Module,
    MulterModule.register({ dest: './uploads' }),
    forwardRef(() => RequestsModule),
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
