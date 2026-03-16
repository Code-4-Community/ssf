import {
  IsNumber,
  IsString,
  Min,
  IsEnum,
  IsNotEmpty,
  Length,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { FoodType } from '../types';

export class CreateDonationItemDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  itemName!: string;

  @IsNumber()
  @Min(1)
  quantity!: number;

  @IsNumber()
  @Min(0.01)
  @IsOptional()
  ozPerItem?: number;

  @IsNumber()
  @Min(0.01)
  @IsOptional()
  estimatedValue?: number;

  @IsEnum(FoodType)
  foodType!: FoodType;

  @IsBoolean()
  @IsOptional()
  foodRescue?: boolean;
}
