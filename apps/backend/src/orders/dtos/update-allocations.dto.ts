import {
  IsArray,
  IsInt,
  IsOptional,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AllocationUpdateDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  allocationId?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  donationItemId?: number;

  @IsInt()
  @Min(1)
  allocatedQuantity!: number;
}

export class UpdateAllocationsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AllocationUpdateDto)
  allocations!: AllocationUpdateDto[];
}
