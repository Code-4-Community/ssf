import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class ConfirmDeliveryDto {
  @IsDateString()
  dateReceived!: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  feedback?: string;
}
