import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  IsPhoneNumber,
  Length,
} from 'class-validator';
import { Role } from '../types';

export class userSchemaDto {
  @IsEmail()
  @IsNotEmpty()
  @Length(1, 255)
  email: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  lastName: string;

  @IsString()
  @IsNotEmpty()
  @IsPhoneNumber('US', {
    message:
      'phone must be a valid phone number (make sure all the digits are correct)',
  })
  phone: string;

  @IsEnum(Role)
  role: Role;
}
