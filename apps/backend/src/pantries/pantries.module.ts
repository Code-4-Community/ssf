import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PantriesService } from './pantries.service';
import { PantriesController } from './pantries.controller';
import { Pantry } from './pantries.entity';
import { AuthModule } from '../auth/auth.module';
import { OrdersModule } from '../orders/order.module';
import { EmailsModule } from '../emails/email.module';
import { User } from '../users/users.entity';
import { UsersModule } from '../users/users.module';
import { Order } from '../orders/order.entity';
import { RequestsModule } from '../foodRequests/request.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Pantry, User, Order]),
    OrdersModule,
    forwardRef(() => UsersModule),
    EmailsModule,
    forwardRef(() => AuthModule),
    RequestsModule,
  ],
  controllers: [PantriesController],
  providers: [PantriesService],
  exports: [PantriesService],
})
export class PantriesModule {}
