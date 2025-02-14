import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequestsModule } from './foodRequests/request.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import typeorm from './config/typeorm';
import { DonationModule } from './donations/donations.module';
import { DonationItemsModule } from './donationItems/donationItems.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [typeorm],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) =>
        configService.get('typeorm'),
    }),
    UsersModule,
    AuthModule,
    RequestsModule,
    DonationModule,
    DonationItemsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
