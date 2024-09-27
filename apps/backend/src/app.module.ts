import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { PantriesModule } from './pantries/pantries.module';
import { AuthModule } from './auth/auth.module';
import { PluralNamingStrategy } from './strategies/plural-naming.strategy';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mongodb',
      host: '127.0.0.1',
      port: 27017,
      database: 'c4cOpsTest',
      // username: 'root',
      // password: 'root',
      autoLoadEntities: true,
      // entities: [join(__dirname, '**/**.entity.{ts,js}')],
      // Setting synchronize: true shouldn't be used in production - otherwise you can lose production data
      synchronize: true,
      namingStrategy: new PluralNamingStrategy(),
    }),
    UsersModule,
    AuthModule,
    PantriesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
