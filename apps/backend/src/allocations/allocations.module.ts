import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Allocation } from './allocations.entity';
import { AllocationsService } from './allocations.service';
import { AuthModule } from '../auth/auth.module';
import { DonationItemsModule } from '../donationItems/donationItems.module';
import { DonationItem } from '../donationItems/donationItems.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Allocation, DonationItem]),
    forwardRef(() => AuthModule),
    DonationItemsModule,
  ],
  providers: [AllocationsService],
  exports: [AllocationsService],
})
export class AllocationModule {}
