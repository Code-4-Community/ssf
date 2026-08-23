import { IsEmail, IsEnum, IsString } from 'class-validator';
import { Role } from '../../users/types';

export class SignUpDto {
  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

  @IsEmail()
  email!: string;

  @IsEnum(Role)
  role!: Role;
}
