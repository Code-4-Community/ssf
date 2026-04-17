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
  IsBoolean,
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

  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'ozPerItem must have at most 2 decimal places' },
  )
  @Min(0.01)
  @IsOptional()
  ozPerItem?: number;

  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'estimatedValue must have at most 2 decimal places' },
  )
  @Min(0.01)
  @IsOptional()
  estimatedValue?: number;

  @IsEnum(FoodType)
  foodType!: FoodType;

  @IsBoolean()
  foodRescue!: boolean;
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
