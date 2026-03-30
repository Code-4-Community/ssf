import { IsArray, IsInt, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdatePantryVolunteersDto {
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Type(() => Number)
  addVolunteerIds?: number[];

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Type(() => Number)
  removeVolunteerIds?: number[];
}
