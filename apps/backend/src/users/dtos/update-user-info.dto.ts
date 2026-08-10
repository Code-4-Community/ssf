import {
  IsString,
  IsPhoneNumber,
  IsOptional,
  IsNotEmpty,
  MaxLength,
} from 'class-validator';

export class UpdateUserInfoDto {
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
      'Phone must be a valid phone number. Make sure all the digits are correct.',
  })
  phone?: string;
}
