import { IsUrl, IsNumber, Min } from "class-validator";

export class TrackingCostDto {
  @IsUrl({}, { message: 'Tracking link must be a valid URL' })
  trackingLink: string;

  @IsNumber({ maxDecimalPlaces: 2, }, { message: 'Shipping cost must have at most 2 decimal places' })
  @Min(0, { message: 'Shipping cost cannot be negative' })
  shippingCost: number;
}