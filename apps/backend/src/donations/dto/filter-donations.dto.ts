import { IsDate, IsDateString, IsEnum, IsInt } from 'class-validator';
import { DonationStatus } from '../types';
import { Timestamp } from 'typeorm';

export class FilterDonationsDto {
  @IsDateString()
  due_date_start: Date;

  @IsDateString()
  due_date_end: Date;

  @IsInt({ each: true })
  pantry_ids: number[];

  @IsEnum(DonationStatus)
  status: string;
}
