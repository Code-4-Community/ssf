import { IsArray, IsInt, IsOptional } from 'class-validator';

export class UpdatePantryVolunteersDto {
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  addVolunteerIds?: number[];

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  removeVolunteerIds?: number[];
}
