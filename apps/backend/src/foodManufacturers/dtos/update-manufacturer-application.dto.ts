import {
  ArrayNotEmpty,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Length,
  MaxLength,
} from 'class-validator';
import { Allergen, DonateWastedFood, ManufacturerAttribute } from '../types';

export class UpdateFoodManufacturerApplicationDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  secondaryContactFirstName?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  secondaryContactLastName?: string;

  @IsOptional()
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  secondaryContactEmail?: string;

  @IsOptional()
  @IsString()
  @IsPhoneNumber('US', {
    message:
      'secondaryContactPhone must be a valid phone number (make sure all the digits are correct)',
  })
  @IsNotEmpty()
  secondaryContactPhone?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @Length(1, 255)
  foodManufacturerName?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @Length(1, 255)
  foodManufacturerWebsite?: string;

  @IsOptional()
  @ArrayNotEmpty()
  @IsEnum(Allergen, { each: true })
  unlistedProductAllergens?: Allergen[];

  @IsOptional()
  @ArrayNotEmpty()
  @IsEnum(Allergen, { each: true })
  facilityFreeAllergens?: Allergen[];

  @IsOptional()
  @IsBoolean()
  productsGlutenFree?: boolean;

  @IsOptional()
  @IsBoolean()
  productsContainSulfites?: boolean;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  productsSustainableExplanation?: string;

  @IsOptional()
  @IsBoolean()
  inKindDonations?: boolean;

  @IsOptional()
  @IsEnum(DonateWastedFood)
  donateWastedFood?: DonateWastedFood;

  @IsOptional()
  @IsEnum(ManufacturerAttribute)
  manufacturerAttribute?: ManufacturerAttribute;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  additionalComments?: string;

  @IsOptional()
  @IsBoolean()
  newsletterSubscription?: boolean;
}
