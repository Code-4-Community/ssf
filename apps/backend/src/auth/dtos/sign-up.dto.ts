import { IsEmail, IsNotEmpty, IsString, IsPhoneNumber } from 'class-validator';

export class SignUpDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsString()
  @IsNotEmpty()
  @IsPhoneNumber('US', {
    message:
      'contactPhone must be a valid phone number (make sure all the digits are correct)',
  })
  phone: string;
}
