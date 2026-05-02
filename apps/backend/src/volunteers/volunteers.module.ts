import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/users.entity';
import { PantriesModule } from '../pantries/pantries.module';
import { AuthModule } from '../auth/auth.module';
import { VolunteersController } from './volunteers.controller';
import { VolunteersService } from './volunteers.service';
import { UsersModule } from '../users/users.module';
import { RequestsModule } from '../foodRequests/request.module';
import { OrdersModule } from '../orders/order.module';
import { EmailsModule } from '../emails/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    UsersModule,
    forwardRef(() => PantriesModule),
    forwardRef(() => AuthModule),
    RequestsModule,
    OrdersModule,
    EmailsModule,
  ],
  controllers: [VolunteersController],
  providers: [VolunteersService],
  exports: [VolunteersService],
})
export class VolunteersModule {}
