import { Module } from '@nestjs/common';
import { OwnershipGuard } from './userType.guard';

@Module({
  providers: [OwnershipGuard],
  exports: [OwnershipGuard],
})
export class SharedAuthModule {}