import { IsNumber, Min, IsBoolean } from 'class-validator';

export class ConfirmDonationItemDetailsDto {
  @IsNumber()
  itemId!: number;

  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Oz per item must have at most 2 decimal places' },
  )
  @Min(0.01, { message: 'Oz per item must be at least 0.01' })
  ozPerItem!: number;

  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Estimated value must have at most 2 decimal places' },
  )
  @Min(0.01, { message: 'Estimated value must be at least 0.01' })
  estimatedValue!: number;

  @IsBoolean()
  foodRescue!: boolean;
}
