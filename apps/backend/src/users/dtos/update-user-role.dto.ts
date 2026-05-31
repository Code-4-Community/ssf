import { IsEnum, IsNotEmpty } from 'class-validator';
import { Role } from '../types';

export class UpdateUserRoleDto {
  @IsEnum(Role)
  @IsNotEmpty()
  role!: Role;
}
