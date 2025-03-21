import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { PantriesService } from './pantries.service';
import { PantriesController } from './pantries.controller';
import { JwtStrategy } from '../auth/jwt.strategy';
import { AuthService } from '../auth/auth.service';
import { Pantry } from './pantries.entity';
import { CurrentUserInterceptor } from '../interceptors/current-user.interceptor';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Pantry, User]), UsersModule],
  controllers: [PantriesController],
  providers: [
    PantriesService,
    AuthService,
    JwtStrategy,
    CurrentUserInterceptor,
  ],
})
export class PantriesModule {}
