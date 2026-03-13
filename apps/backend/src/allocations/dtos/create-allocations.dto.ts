import { IsNumber, IsObject } from 'class-validator';

export class CreateMultipleAllocationsDto {
  @IsNumber()
  orderId!: number;

  @IsObject()
  itemAllocations!: Record<number, number>;
}
