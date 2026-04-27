import { IsNumber, Min, IsBoolean, IsInt, IsOptional } from 'class-validator';

export class UpdateDonationItemDetailsDto {
  @IsInt()
  itemId!: number;

  @IsOptional()
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Oz per item must have at most 2 decimal places' },
  )
  @Min(0.01, { message: 'Oz per item must be at least 0.01' })
  ozPerItem?: number;

  @IsOptional()
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Estimated value must have at most 2 decimal places' },
  )
  @Min(0.01, { message: 'Estimated value must be at least 0.01' })
  estimatedValue?: number;

  @IsOptional()
  @IsBoolean()
  foodRescue?: boolean;
}
