import {
  IsString,
  IsPhoneNumber,
  IsOptional,
  IsNotEmpty,
  MaxLength,
} from 'class-validator';

export class updateUserInfo {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  firstName?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  lastName?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @IsPhoneNumber('US', {
    message:
      'phone must be a valid phone number (make sure all the digits are correct)',
  })
  phone?: string;
}
