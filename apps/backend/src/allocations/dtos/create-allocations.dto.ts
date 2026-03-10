import { IsNumber, IsObject } from 'class-validator';

export class CreateMultipleAllocationsDto {
  @IsNumber()
  orderId!: number;

  @IsObject()
  donationItems!: Record<number, number>;
}
