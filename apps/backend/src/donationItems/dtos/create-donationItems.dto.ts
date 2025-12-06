import { IsInt, IsNumber, IsString, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { FoodType } from '../types';

export class CreateDonationItemDto {
  @IsString()
  itemName: string;

  @IsInt()
  @Min(0)
  quantity: number;

  @IsInt()
  @Min(0)
  reservedQuantity: number;

  @IsString()
  status: string;

  @IsNumber()
  ozPerItem: number;

  @IsNumber()
  estimatedValue: number;

  @IsString()
  foodType: FoodType;
}

export class CreateMultipleDonationItemsDto {
  @IsInt()
  donationId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateDonationItemDto)
  items: CreateDonationItemDto[];
}
