import { IsString } from 'class-validator';

export class ConfirmDeliveryDto {
  @IsString()
  dateReceived: string;

  @IsString()
  feedback: string;
}
