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
  DedicatedAllergyFriendly,
  ServeAllergicChildren,
  Activity,
} from '../types';

export class PantryApplicationDto {
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

  // This validation is very strict and won't accept phone numbers
  // that look right but aren't actually possible phone numbers
  @IsString()
  @IsNotEmpty()
  @IsPhoneNumber('US', {
    message:
      'contactPhone must be a valid phone number (make sure all the digits are correct)',
  })
  contactPhone!: string;

  @IsBoolean()
  hasEmailContact!: boolean;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
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
  pantryName!: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  shipmentAddressLine1!: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  shipmentAddressLine2?: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  shipmentAddressCity!: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  shipmentAddressState!: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  shipmentAddressZip!: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  shipmentAddressCountry!: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  mailingAddressLine1!: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  mailingAddressLine2?: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  mailingAddressCity!: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  mailingAddressState!: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  mailingAddressZip!: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  mailingAddressCountry!: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 25)
  allergenClients!: string;

  @ArrayNotEmpty()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  @MaxLength(255, { each: true })
  restrictions!: string[];

  @ArrayNotEmpty()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  @MaxLength(255, { each: true })
  languages!: string[];

  @IsEnum(RefrigeratedDonation)
  refrigeratedDonation!: RefrigeratedDonation;

  @IsBoolean()
  acceptFoodDeliveries!: boolean;

  @IsString()
  @IsNotEmpty()
  deliveryWindowInstructions!: string;

  @IsEnum(ReserveFoodForAllergic)
  reserveFoodForAllergic!: ReserveFoodForAllergic;

  // TODO: Really, this validation should be different depending on the value of reserveFoodForAllergic
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  reservationExplanation?: string;

  @IsEnum(DedicatedAllergyFriendly)
  dedicatedAllergyFriendly!: DedicatedAllergyFriendly;

  @IsEnum(ClientVisitFrequency)
  clientVisitFrequency!: ClientVisitFrequency;

  @IsEnum(ServeAllergicChildren)
  serveAllergicChildren!: ServeAllergicChildren;

  @ArrayNotEmpty()
  @IsEnum(Activity, { each: true })
  activities!: Activity[];

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  activitiesComments?: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  itemsInStock!: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  needMoreOptions!: string;
}
