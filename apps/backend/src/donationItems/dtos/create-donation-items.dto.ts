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
} from 'class-validator';
import { Type } from 'class-transformer';
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
  @Min(0)
  reservedQuantity!: number;

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  ozPerItem?: number;

  @IsOptional()
  @IsNumber()
  @Min(0.01)
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
