import { IsDate, IsEnum, IsInt } from 'class-validator';
import { DonationStatus } from '../types';

export class FilterDonationsDto {
  @IsDate()
  due_date_start: Date;

  @IsDate()
  due_date_end: Date;

  @IsInt({ each: true })
  pantry_ids: number[];

  @IsEnum(DonationStatus)
  status: string;
}
