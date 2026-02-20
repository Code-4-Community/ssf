import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { RecurrenceEnum } from '../types';
import { Type } from 'class-transformer';

export class RepeatOnDaysDto {
  @IsBoolean()
  @IsOptional()
  Monday?: boolean;

  @IsBoolean()
  @IsOptional()
  Tuesday?: boolean;

  @IsBoolean()
  @IsOptional()
  Wednesday?: boolean;

  @IsBoolean()
  @IsOptional()
  Thursday?: boolean;

  @IsBoolean()
  @IsOptional()
  Friday?: boolean;

  @IsBoolean()
  @IsOptional()
  Saturday?: boolean;

  @IsBoolean()
  @IsOptional()
  Sunday?: boolean;
}

export class CreateDonationDto {
  @IsNumber()
  @Min(1)
  foodManufacturerId!: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  totalItems?: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @IsOptional()
  totalOz?: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @IsOptional()
  totalEstimatedValue?: number;

  @IsNotEmpty()
  @IsEnum(RecurrenceEnum)
  recurrence!: RecurrenceEnum;

  @IsNumber()
  @ValidateIf((o) => o.recurrence !== RecurrenceEnum.NONE)
  @Min(1)
  recurrenceFreq?: number;

  @IsObject()
  @ValidateNested()
  @Type(() => RepeatOnDaysDto)
  @ValidateIf((o) => o.recurrence === RecurrenceEnum.WEEKLY)
  repeatOnDays?: RepeatOnDaysDto;

  @IsNumber()
  @ValidateIf((o) => o.recurrence !== RecurrenceEnum.NONE)
  @Min(1)
  occurrencesRemaining?: number;
}
