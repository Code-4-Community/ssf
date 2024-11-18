import { IsDateString, IsEnum, IsInt, IsOptional } from 'class-validator';
import { DonationStatus } from '../types';

export class FilterDonationsDto {
  @IsDateString()
  @IsOptional()
  due_date_start: Date;

  @IsDateString()
  @IsOptional()
  due_date_end: Date;

  @IsInt({ each: true })
  @IsOptional()
  pantry_ids: number[];

  @IsEnum(DonationStatus)
  @IsOptional()
  status: string;
}
