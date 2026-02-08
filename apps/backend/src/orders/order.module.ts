import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersController } from './order.controller';
import { Order } from './order.entity';
import { OrdersService } from './order.service';
import { JwtStrategy } from '../auth/jwt.strategy';
import { AuthService } from '../auth/auth.service';
import { Pantry } from '../pantries/pantries.entity';
import { AllocationModule } from '../allocations/allocations.module';
import { FoodRequest } from '../foodRequests/request.entity';
import { AWSS3Module } from '../aws/aws-s3.module';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, Pantry, FoodRequest]),
    AllocationModule,
    AWSS3Module,
    MulterModule.register({ dest: './uploads' }),
  ],
  controllers: [OrdersController],
  providers: [OrdersService, AuthService, JwtStrategy],
  exports: [OrdersService],
})
export class OrdersModule {}
