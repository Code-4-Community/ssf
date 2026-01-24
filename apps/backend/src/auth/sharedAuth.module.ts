import { Module } from '@nestjs/common';
import { OwnershipGuard } from './ownership.guard';

@Module({
  providers: [OwnershipGuard],
  exports: [OwnershipGuard],
})
export class SharedAuthModule {}
