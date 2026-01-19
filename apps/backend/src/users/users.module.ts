import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { JwtStrategy } from '../auth/jwt.strategy';
import { CurrentUserInterceptor } from '../interceptors/current-user.interceptor';
import { AuthService } from '../auth/auth.service';
import { PantriesModule } from '../pantries/pantries.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), PantriesModule],
  exports: [UsersService],
  controllers: [UsersController],
  providers: [UsersService, AuthService, JwtStrategy, CurrentUserInterceptor],
  exports: [UsersService],
})
export class UsersModule {}
