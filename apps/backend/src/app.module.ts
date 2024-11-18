import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { PantriesModule } from './pantries/pantries.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import typeorm from './config/typeorm';
import { PantryReqsModule } from './pantryRequests/pantryRequests.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [typeorm],
    }),
    // Load TypeORM config async so we can target the config file (config/typeorm.ts) for migrations
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) =>
        configService.get('typeorm'),
    }),
    UsersModule,
    AuthModule,
    PantriesModule,
    PantryReqsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
