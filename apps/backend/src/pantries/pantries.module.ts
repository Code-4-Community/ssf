import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PantriesService } from './pantries.service';
import { PantriesController } from './pantries.controller';
import { Pantry } from './pantries.entity';
import { OrdersModule } from '../orders/order.module';
import { User } from '../users/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Pantry, User]), OrdersModule],
  controllers: [PantriesController],
  providers: [PantriesService],
  exports: [PantriesService],
})
export class PantriesModule {}
