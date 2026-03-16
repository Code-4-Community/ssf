import { IsNotEmptyObject, IsNumber, IsObject, Min } from 'class-validator';

export class CreateMultipleAllocationsDto {
  @IsNumber()
  @Min(1)
  orderId!: number;

  @IsObject()
  @IsNotEmptyObject()
  itemAllocations!: Record<number, number>;
}
