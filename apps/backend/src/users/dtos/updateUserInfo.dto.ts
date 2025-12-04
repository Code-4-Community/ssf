import { IsString, IsPhoneNumber, IsOptional } from 'class-validator';

export class updateUserInfo {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  @IsPhoneNumber('US', {
    message:
      'phone must be a valid phone number (make sure all the digits are correct)',
  })
  phone?: string;
}
