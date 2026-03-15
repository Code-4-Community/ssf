import { IsNotEmptyObject, IsNumber, IsObject, Min } from 'class-validator';

export class CreateOrderDto {
  @IsNumber()
  @Min(1)
  foodRequestId!: number;

  @Min(1)
  @IsNumber()
  manufacturerId!: number;

  @IsObject()
  @IsNotEmptyObject()
  itemAllocations!: Record<number, number>;
}
