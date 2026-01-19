import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Allocation } from './allocations.entity';
import { AllocationsController } from './allocations.controller';
import { AllocationsService } from './allocations.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Allocation]), forwardRef(() => AuthModule)],
  controllers: [AllocationsController],
  providers: [AllocationsService],
  exports: [AllocationsService],
})
export class AllocationModule {}
