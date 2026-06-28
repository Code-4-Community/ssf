import {
  IsNumber,
  IsString,
  Min,
  IsEnum,
  IsNotEmpty,
  Length,
  IsInt,
  IsBoolean,
} from 'class-validator';
import { FoodType } from '../types';

export class CreateDonationItemDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  itemName!: string;

  @IsInt()
  @Min(1)
  quantity!: number;

  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'ozPerItem must have at most 2 decimal places' },
  )
  @Min(0.01)
  ozPerItem!: number;

  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'estimatedValue must have at most 2 decimal places' },
  )
  @Min(0.01)
  estimatedValue!: number;

  @IsEnum(FoodType)
  foodType!: FoodType;

  @IsBoolean()
  foodRescue!: boolean;
}
