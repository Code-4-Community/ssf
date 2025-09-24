import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtStrategy } from '../auth/jwt.strategy';
import { AuthService } from '../auth/auth.service';
import { Assignments } from './volunteerAssignments.entity';
import { AssignmentsController } from './volunteerAssignments.controller';
import { AssignmentsService } from './volunteerAssignments.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Assignments]), UsersModule],
  controllers: [AssignmentsController],
  providers: [AssignmentsService, AuthService, JwtStrategy],
})
export class AssignmentsModule {}
