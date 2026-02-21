import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PantriesService } from './pantries.service';
import { PantriesController } from './pantries.controller';
import { Pantry } from './pantries.entity';
import { AuthModule } from '../auth/auth.module';
import { OrdersModule } from '../orders/order.module';
import { User } from '../users/user.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Pantry, User]),
    OrdersModule,
    forwardRef(() => UsersModule),
    forwardRef(() => AuthModule),
  ],
  controllers: [PantriesController],
  providers: [PantriesService],
  exports: [PantriesService],
})
export class PantriesModule {}
