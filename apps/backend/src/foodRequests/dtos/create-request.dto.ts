import {
  ArrayNotEmpty,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { RequestSize } from '../types';

export class CreateRequestDto {
  @IsNotEmpty()
  @IsNumber()
  pantryId!: number;

  @IsEnum(RequestSize)
  requestedSize!: RequestSize;

  @ArrayNotEmpty()
  requestedItems!: string[];

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  additionalInformation?: string;
}
