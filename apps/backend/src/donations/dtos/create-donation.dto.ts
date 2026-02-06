import { ArrayNotEmpty, IsArray, IsDate, IsEnum, IsNotEmpty, IsNumber, IsOptional, Min } from "class-validator";
import { DonationStatus, RecurrenceEnum } from "../types";
import { Type } from "class-transformer";

export class CreateDonationDto {
  @IsNumber()
  @Min(1)
  foodManufacturerId: number;

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  dateDonated: Date;

  @IsNotEmpty()
  @IsEnum(DonationStatus)
  status: DonationStatus;

  @IsNumber()
  @Min(1)
  totalItems: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  totalOz: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  totalEstimatedValue: number;

  @IsEnum(RecurrenceEnum)
  recurrence: RecurrenceEnum;

  @IsNumber()
  @IsOptional()
  @Min(1)
  recurrenceFreq?: number;

  @Type(() => Date)
  @IsArray()
  @ArrayNotEmpty()
  @IsDate({ each: true })
  @IsOptional()
  nextDonationDates?: Date[];

  @IsNumber()
  @IsOptional()
  @Min(1)
  occurrencesRemaining?: number;
}