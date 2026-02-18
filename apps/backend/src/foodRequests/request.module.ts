import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequestsController } from './request.controller';
import { FoodRequest } from './request.entity';
import { RequestsService } from './request.service';
import { AWSS3Module } from '../aws/aws-s3.module';
import { MulterModule } from '@nestjs/platform-express';
import { AuthModule } from '../auth/auth.module';
import { OrdersService } from '../orders/order.service';
import { Order } from '../orders/order.entity';
import { Pantry } from '../pantries/pantries.entity';
import { SharedAuthModule } from '../auth/sharedAuth.module';

@Module({
  imports: [
    AWSS3Module,
    MulterModule.register({ dest: './uploads' }),
    TypeOrmModule.forFeature([FoodRequest, Order, Pantry]),
    AuthModule,
    SharedAuthModule,
  ],
  controllers: [RequestsController],
  providers: [RequestsService, OrdersService],
})
export class RequestsModule {}
