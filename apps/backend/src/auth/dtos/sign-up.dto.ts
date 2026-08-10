import { IsEmail, IsNotEmpty, IsString, IsPhoneNumber } from 'class-validator';

export class SignUpDto {
  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

  @IsEmail()
  email!: string;

  @IsString()
  password!: string;

  @IsString()
  @IsNotEmpty()
  @IsPhoneNumber('US', {
    message:
      'Phone must be a valid phone number. Make sure all the digits are correct.',
  })
  phone!: string;
}
