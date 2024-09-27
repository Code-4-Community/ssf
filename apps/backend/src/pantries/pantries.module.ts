import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PantriesController } from './pantries.controller';
import { PantriesService } from './pantries.service';
import { UsersService } from '../users/users.service';
import { Pantry } from './pantry.entity';
import { JwtStrategy } from '../auth/jwt.strategy';
import { CurrentUserInterceptor } from '../interceptors/current-user.interceptor';
import { AuthService } from '../auth/auth.service';
import { User } from '../users/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Pantry])],
  controllers: [PantriesController],
  providers: [
    UsersService,
    PantriesService,
    AuthService,
    JwtStrategy,
    CurrentUserInterceptor,
  ],
})
export class PantriesModule {}
