import { IsArray, IsInt, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { TrackingCostDto } from './tracking-cost.dto';

export class OrderTrackingCostEntryDto extends TrackingCostDto {
  @IsInt()
  @Min(1)
  orderId!: number;
}

export class BulkUpdateTrackingCostDto {
  @IsInt()
  @Min(1)
  donationId!: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderTrackingCostEntryDto)
  orders!: OrderTrackingCostEntryDto[];
}
