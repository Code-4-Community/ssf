import { IsInt, IsNotEmptyObject, IsObject, Min } from 'class-validator';

export class CreateOrderDto {
  @IsInt()
  @Min(1)
  foodRequestId!: number;

  @IsInt()
  @Min(1)
  manufacturerId!: number;

  // This object is not fully validated, the validation is handled in the controller where the DTO is used.
  @IsObject()
  @IsNotEmptyObject()
  itemAllocations!: Record<string, number>;
}
