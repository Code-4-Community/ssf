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
import { Allergen, DonateWastedFood } from '../types';

export class FoodManufacturerApplicationDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  foodManufacturerName!: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  foodManufacturerWebsite!: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  contactFirstName!: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  contactLastName!: string;

  @IsEmail()
  @IsNotEmpty()
  @Length(1, 255)
  contactEmail!: string;

  @IsString()
  @IsNotEmpty()
  @IsPhoneNumber('US', {
    message: 'Phone must be a valid US phone number.',
  })
  contactPhone!: string;

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
    message: 'Secondary phone contact must be a valid US phone number.',
  })
  @IsNotEmpty()
  secondaryContactPhone?: string;

  @ArrayNotEmpty()
  @IsEnum(Allergen, { each: true })
  unlistedProductAllergens!: Allergen[];

  @ArrayNotEmpty()
  @IsEnum(Allergen, { each: true })
  facilityFreeAllergens!: Allergen[];

  @IsBoolean()
  productsGlutenFree!: boolean;

  @IsString()
  @IsNotEmpty()
  productsSustainableExplanation!: string;

  @IsBoolean()
  inKindDonations!: boolean;

  @IsEnum(DonateWastedFood)
  donateWastedFood!: DonateWastedFood;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  additionalComments?: string;
}
