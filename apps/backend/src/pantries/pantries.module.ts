import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PantriesService } from './pantries.service';
import { PantriesController } from './pantries.controller';
import { Pantry } from './pantries.entity';
import { AuthModule } from '../auth/auth.module';
import { OrdersModule } from '../orders/order.module';
import { EmailsModule } from '../emails/email.module';
import { User } from '../users/user.entity';
import { SharedAuthModule } from '../auth/sharedAuth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Pantry, User]),
    OrdersModule,
    EmailsModule,
    forwardRef(() => AuthModule),
    SharedAuthModule,
  ],
  controllers: [PantriesController],
  providers: [PantriesService],
  exports: [PantriesService],
})
export class PantriesModule {}
