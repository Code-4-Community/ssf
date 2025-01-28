import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { PantriesService } from './pantries.service';
import { PantriesController } from './pantries.controller';
import { JwtStrategy } from '../auth/jwt.strategy';
import { CurrentUserInterceptor } from '../interceptors/current-user.interceptor';
import { AuthService } from '../auth/auth.service';
import { Pantry } from './pantries.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Pantry, User])],
  controllers: [PantriesController],
  providers: [PantriesService, AuthService, JwtStrategy],
})
export class UsersModule {}
