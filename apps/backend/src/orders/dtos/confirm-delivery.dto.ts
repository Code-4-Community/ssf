import { IsDateString, IsOptional, IsString } from 'class-validator';

export class ConfirmDeliveryDto {
  @IsDateString()
  dateReceived!: string;

  @IsOptional()
  @IsString()
  feedback?: string;
}
