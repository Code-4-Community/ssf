import {
  ArrayNotEmpty,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { RequestSize } from '../types';
import { FoodType } from '../../donationItems/types';

export class UpdateRequestDto {
  @IsOptional()
  @IsEnum(RequestSize)
  requestedSize?: RequestSize;

  @IsOptional()
  @ArrayNotEmpty()
  @IsEnum(FoodType, { each: true })
  requestedFoodTypes?: FoodType[];

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  additionalInformation?: string;
}
