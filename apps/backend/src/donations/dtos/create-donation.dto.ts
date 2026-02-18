import {
  ArrayNotEmpty,
  IsArray,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
  ValidateIf,
} from 'class-validator';
import { RecurrenceEnum } from '../types';
import { Type } from 'class-transformer';

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

  @Type(() => Date)
  @IsArray()
  @ArrayNotEmpty()
  @IsDate({ each: true })
  @ValidateIf((o) => o.recurrence !== RecurrenceEnum.NONE)
  nextDonationDates?: Date[];

  @IsNumber()
  @ValidateIf((o) => o.recurrence !== RecurrenceEnum.NONE)
  @Min(1)
  occurrencesRemaining?: number;
}
