import { IsEmail, IsString } from 'class-validator';

export class ConfirmPasswordDto {
  @IsEmail()
  email: string;

  @IsString()
  newPassword: string;

  @IsString()
  confirmationCode: string;
}
