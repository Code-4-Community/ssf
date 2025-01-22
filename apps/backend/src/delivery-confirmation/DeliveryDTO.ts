import { IsDate, IsOptional, IsString, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class DeliveryDto {
  @IsDate()
  @Type(() => Date)
  deliveryDate: Date;

  @IsOptional()
  @IsString()
  feedback?: string;

  @IsOptional()
  @IsArray()
  @Type(() => String)
  photoPaths?: string[];
}
