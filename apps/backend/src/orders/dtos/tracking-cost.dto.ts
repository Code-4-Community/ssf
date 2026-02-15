import { IsUrl, IsNumber, Min, IsOptional } from 'class-validator';

export class TrackingCostDto {
  @IsUrl({}, { message: 'Tracking link must be a valid URL' })
  @IsOptional()
  trackingLink?: string;

  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Shipping cost must have at most 2 decimal places' },
  )
  @Min(0, { message: 'Shipping cost cannot be negative' })
  @IsOptional()
  shippingCost?: number;
}
