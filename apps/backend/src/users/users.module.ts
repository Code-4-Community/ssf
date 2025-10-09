import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { JwtStrategy } from '../auth/jwt.strategy';
import { CurrentUserInterceptor } from '../interceptors/current-user.interceptor';
import { AuthService } from '../auth/auth.service';
import { Assignments } from '../volunteerAssignments/volunteerAssignments.entity';
import { Pantry } from '../pantries/pantries.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Assignments, Pantry])],
  exports: [UsersService, TypeOrmModule],
  controllers: [UsersController],
  providers: [UsersService, AuthService, JwtStrategy, CurrentUserInterceptor],
})
export class UsersModule {}
