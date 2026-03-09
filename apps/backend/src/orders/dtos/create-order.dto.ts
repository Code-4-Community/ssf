import { IsNumber, IsObject } from 'class-validator';

export class CreateOrderDto {
  @IsNumber()
  foodRequestId!: number;

  @IsNumber()
  manufacturerId!: number;

  @IsObject()
  donationItems!: Record<number, number>;
}
