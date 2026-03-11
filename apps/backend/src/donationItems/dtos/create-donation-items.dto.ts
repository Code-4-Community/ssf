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
import { Type } from 'class-transformer';
import { FoodType } from '../types';

export class CreateDonationItemDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  itemName!: string;

  @IsInt()
  @Min(1)
  quantity!: number;

  @IsInt()
  @Min(0)
  reservedQuantity!: number;

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
}

export class CreateMultipleDonationItemsDto {
  @IsNumber()
  donationId!: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateDonationItemDto)
  items!: CreateDonationItemDto[];
}
