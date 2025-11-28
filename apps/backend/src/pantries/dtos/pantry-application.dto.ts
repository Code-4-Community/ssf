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
  @Length(1, 255)
  contactFirstName: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  contactLastName: string;

  @IsEmail()
  @Length(1, 255)
  contactEmail: string;

  // This validation is very strict and won't accept phone numbers
  // that look right but aren't actually possible phone numbers
  @IsString()
  @IsNotEmpty()
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
  @MaxLength(255)
  emailContactOther?: string;
  
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
  @Length(1, 255)
  pantryName: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  shipmentAddressLine1: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  shipmentAddressLine2?: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  shipmentAddressCity: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  shipmentAddressState: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  shipmentAddressZip: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  shipmentAddressCountry?: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  mailingAddressLine1: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  mailingAddressLine2?: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  mailingAddressCity: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  mailingAddressState: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  mailingAddressZip: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  mailingAddressCountry?: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 25)
  allergenClients: string;

  @IsOptional()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  @MaxLength(255, { each: true })
  restrictions?: string[];

  @IsEnum(RefrigeratedDonation)
  refrigeratedDonation: RefrigeratedDonation;

  @IsBoolean()
  acceptFoodDeliveries: boolean;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  deliveryWindowInstructions?: string;

  @IsEnum(ReserveFoodForAllergic)
  reserveFoodForAllergic: ReserveFoodForAllergic;

  // TODO: Really, this validation should be different depending on the value of reserveFoodForAllergic
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
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
  @IsNotEmpty()
  @MaxLength(255)
  activitiesComments?: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  itemsInStock: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  needMoreOptions: string;

  @IsOptional()
  @IsBoolean()
  newsletterSubscription?: boolean;
}
