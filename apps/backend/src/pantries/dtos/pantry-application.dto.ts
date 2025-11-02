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
import {
  RefrigeratedDonation,
  ReserveFoodForAllergic,
  ClientVisitFrequency,
  AllergensConfidence,
  ServeAllergicChildren,
  Activity,
} from '../types';

export class PantryApplicationDto {
  @IsString()
  @IsNotEmpty()
  contactFirstName: string;

  @IsString()
  @IsNotEmpty()
  contactLastName: string;

  @IsEmail()
  contactEmail: string;

  // This validation is very strict and won't accept phone numbers
  // that look right but aren't actually possible phone numbers
  @IsPhoneNumber('US', {
    message:
      'contactPhone must be a valid phone number (make sure all the digits are correct)',
  })
  contactPhone: string;

  @IsString()
  @Length(1, 255)
  pantryName: string;

  @IsString()
  @Length(1, 255)
  addressLine1: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  addressLine2?: string;

  @IsString()
  @Length(1, 255)
  addressCity: string;

  @IsString()
  @Length(1, 255)
  addressState: string;

  @IsString()
  @Length(1, 255)
  addressZip: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  addressCountry?: string;

  @IsString()
  @Length(1, 25)
  allergenClients: string;

  @IsOptional()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  restrictions?: string[];

  @IsEnum(RefrigeratedDonation)
  refrigeratedDonation: RefrigeratedDonation;

  @IsBoolean()
  acceptFoodDeliveries: boolean;

  @IsOptional()
  @IsString()
  deliveryWindowInstructions?: string;

  @IsEnum(ReserveFoodForAllergic)
  reserveFoodForAllergic: ReserveFoodForAllergic;

  // TODO: Really, this validation should be different depending on the value of reserveFoodForAllergic
  @IsOptional()
  @IsString()
  reservationExplanation?: string;

  @IsBoolean()
  dedicatedAllergyFriendly: boolean;

  @IsOptional()
  @IsEnum(ClientVisitFrequency)
  clientVisitFrequency?: ClientVisitFrequency;

  @IsOptional()
  @IsEnum(AllergensConfidence)
  identifyAllergensConfidence?: AllergensConfidence;

  @IsOptional()
  @IsEnum(ServeAllergicChildren)
  serveAllergicChildren?: ServeAllergicChildren;

  @ArrayNotEmpty()
  @IsEnum(Activity, { each: true })
  activities: Activity[];

  @IsOptional()
  @IsString()
  activitiesComments?: string;

  @IsString()
  @IsNotEmpty()
  itemsInStock: string;

  @IsString()
  @IsNotEmpty()
  needMoreOptions: string;

  @IsOptional()
  @IsBoolean()
  newsletterSubscription?: boolean;
}
