import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequestsModule } from './foodRequests/request.module';
import { PantriesModule } from './pantries/pantries.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import typeorm from './config/typeorm';
import { OrdersModule } from './orders/order.module';
import { ManufacturerModule } from './foodManufacturers/manufacturers.module';
import { DonationModule } from './donations/donations.module';
import { DonationItemsModule } from './donationItems/donationItems.module';
import { AllocationModule } from './allocations/allocations.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    MulterModule.register({
      dest: './uploads',
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [typeorm],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) =>
        configService.getOrThrow('typeorm'),
    }),
    ScheduleModule.forRoot(),
    UsersModule,
    AuthModule,
    PantriesModule,
    RequestsModule,
    DonationModule,
    DonationItemsModule,
    OrdersModule,
    ManufacturerModule,
    AllocationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
