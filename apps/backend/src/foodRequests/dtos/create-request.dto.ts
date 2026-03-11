import {
  ArrayNotEmpty,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { RequestSize } from '../types';
import { FoodType } from '../../donationItems/types';

export class CreateRequestDto {
  @IsNumber()
  pantryId!: number;

  @IsEnum(RequestSize)
  requestedSize!: RequestSize;

  @ArrayNotEmpty()
  @IsEnum(FoodType, { each: true })
  requestedFoodTypes!: FoodType[];

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  additionalInformation?: string;
}
