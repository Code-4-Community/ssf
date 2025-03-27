import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Allocation } from './allocations.entity';
import { AllocationsController } from './allocations.controller';
import { AllocationsService } from './allocations.service';
import { AuthService } from '../auth/auth.service';
import { JwtStrategy } from '../auth/jwt.strategy';

@Module({
  imports: [TypeOrmModule.forFeature([Allocation])],
  controllers: [AllocationsController],
  providers: [AllocationsService, AuthService, JwtStrategy],
})
export class AllocationModule {}
