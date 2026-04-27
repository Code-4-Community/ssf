import {
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsUrl,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class OrderTrackingCostEntryDto {
  @IsInt()
  @Min(1)
  orderId!: number;

  @IsOptional()
  @IsUrl(
    {
      protocols: ['http', 'https'],
    },
    { message: 'Tracking link must be a valid HTTP/HTTPS URL' },
  )
  trackingLink?: string;

  @IsOptional()
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Shipping cost must have at most 2 decimal places' },
  )
  @Min(0, { message: 'Shipping cost cannot be negative' })
  shippingCost?: number;
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
