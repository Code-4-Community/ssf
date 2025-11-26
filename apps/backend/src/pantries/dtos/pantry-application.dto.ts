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

  @IsBoolean()
  hasEmailContact: boolean;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  hasEmailContactOther?: string;
  
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  secondaryContactFirstName?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  secondaryContactLastName?: string;

  @IsOptional()
  @IsEmail()
  secondaryContactEmail?: string;

  @IsOptional()
  @IsPhoneNumber('US', {
    message:
      'secondaryContactPhone must be a valid phone number (make sure all the digits are correct)',
  })
  secondaryContactPhone?: string;

  @IsString()
  @Length(1, 255)
  pantryName: string;

  @IsString()
  @Length(1, 255)
  shipmentAddressLine1: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  shipmentAddressLine2?: string;

  @IsString()
  @Length(1, 255)
  shipmentAddressCity: string;

  @IsString()
  @Length(1, 255)
  shipmentAddressState: string;

  @IsString()
  @Length(1, 255)
  shipmentAddressZip: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  shipmentAddressCountry?: string;

  @IsString()
  @Length(1, 255)
  mailingAddressLine1: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  mailingAddressLine2?: string;

  @IsString()
  @Length(1, 255)
  mailingAddressCity: string;

  @IsString()
  @Length(1, 255)
  mailingAddressState: string;

  @IsString()
  @Length(1, 255)
  mailingAddressZip: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  mailingAddressCountry?: string;

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
