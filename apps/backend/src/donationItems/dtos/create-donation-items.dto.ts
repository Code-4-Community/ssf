import {
  IsNumber,
  IsString,
  IsArray,
  ValidateNested,
  Min,
  IsEnum,
  IsNotEmpty,
  Length,
  IsOptional,
  IsInt,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { FoodType } from '../types';

export class CreateDonationItemDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  itemName!: string;

  @Transform(({ value }) => parseInt(value, 10))
  @IsInt({ message: 'Quantity must be an integer value' })
  @Min(1, { message: 'Quantity must be at least 1' })
  quantity!: number;

  @IsInt()
  @Min(0)
  reservedQuantity!: number;

  @Transform(({ value }) => parseFloat(value))
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Oz per item must have at most 2 decimal places' },
  )
  @Min(0.01, { message: 'Oz per item must be at least 0.01' })
  @IsOptional()
  ozPerItem?: number;

  @Transform(({ value }) => parseFloat(value))
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Estimated value must have at most 2 decimal places' },
  )
  @Min(0.01, { message: 'Estimated value must be at least 0.01' })
  @IsOptional()
  estimatedValue?: number;

  @IsEnum(FoodType)
  foodType!: FoodType;
}

export class CreateMultipleDonationItemsDto {
  @IsNumber()
  donationId!: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateDonationItemDto)
  items!: CreateDonationItemDto[];
}

export class ReplaceDonationItemDto extends CreateDonationItemDto {
  @IsOptional()
  @IsNumber()
  id?: number;
}

export class ReplaceDonationItemsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReplaceDonationItemDto)
  items!: ReplaceDonationItemDto[];
}
