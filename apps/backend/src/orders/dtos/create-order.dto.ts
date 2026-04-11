import { IsInt, IsNotEmptyObject, IsObject, Min } from 'class-validator';

export class CreateOrderDto {
  @IsInt()
  @Min(1)
  foodRequestId!: number;

  @IsInt()
  @Min(1)
  manufacturerId!: number;

  // This object is not fully validated, the validation is handled in the controller where the DTO is used.
  // We would like this type to be Record<string, number> where the key is the donationItemId and the value is reserved quantity
  @IsObject()
  @IsNotEmptyObject()
  itemAllocations!: Record<string, unknown>;
}
