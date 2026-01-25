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

export class FoodManufacturerApplicationDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  foodManufacturerName: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  foodManufacturerWebsite: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  contactFirstName: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  contactLastName: string;

  @IsEmail()
  @IsNotEmpty()
  @Length(1, 255)
  contactEmail: string;

  @IsString()
  @IsNotEmpty()
  @IsPhoneNumber('US', {
    message:
      'contactPhone must be a valid phone number (make sure all the digits are correct)',
  })
  contactPhone: string;

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

  @ArrayNotEmpty()
  @IsEnum(Allergen, { each: true })
  unlistedProductAllergens: Allergen[];

  @ArrayNotEmpty()
  @IsEnum(Allergen, { each: true })
  facilityFreeAllergens: Allergen[];

  @IsBoolean()
  productsGlutenFree: boolean;

  @IsBoolean()
  productsContainSulfites: boolean;

  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  productsSustainableExplanation: string;

  @IsBoolean()
  inKindDonations: boolean;

  @IsEnum(DonateWastedFood)
  donateWastedFood: DonateWastedFood;

  @IsOptional()
  @IsEnum(ManufacturerAttribute)
  manufacturerAttribute?: ManufacturerAttribute;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  additionalComments?: string;

  @IsOptional()
  @IsBoolean()
  newsletterSubscription?: boolean;
}
