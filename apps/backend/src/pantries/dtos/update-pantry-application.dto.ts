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

export class UpdatePantryApplicationDto {
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
  @IsEmail(
    {},
    { message: 'Secondary contact email must be a valid email address.' },
  )
  @IsNotEmpty()
  @MaxLength(255)
  secondaryContactEmail?: string;

  @IsOptional()
  @IsString()
  @IsPhoneNumber('US', {
    message:
      'Secondary contact phone must be a valid phone number (make sure all the digits are correct)',
  })
  @IsNotEmpty()
  secondaryContactPhone?: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @Length(1, 255)
  shipmentAddressLine1?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  shipmentAddressLine2?: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @Length(1, 255)
  shipmentAddressCity?: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @Length(1, 255)
  shipmentAddressState?: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @Length(1, 255)
  shipmentAddressZip?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  shipmentAddressCountry?: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @Length(1, 255)
  mailingAddressLine1?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  mailingAddressLine2?: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @Length(1, 255)
  mailingAddressCity?: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @Length(1, 255)
  mailingAddressState?: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @Length(1, 255)
  mailingAddressZip?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  mailingAddressCountry?: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @Length(1, 25)
  allergenClients?: string;

  @ArrayNotEmpty()
  @IsOptional()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  @MaxLength(255, { each: true })
  restrictions?: string[];

  @IsBoolean()
  @IsOptional()
  acceptFoodDeliveries?: boolean;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  deliveryWindowInstructions?: string;

  @IsEnum(RefrigeratedDonation)
  @IsOptional()
  refrigeratedDonation?: RefrigeratedDonation;

  @IsEnum(ReserveFoodForAllergic)
  @IsOptional()
  reserveFoodForAllergic?: ReserveFoodForAllergic;

  @IsOptional()
  @IsString()
  reservationExplanation?: string | null;

  @IsBoolean()
  @IsOptional()
  dedicatedAllergyFriendly?: boolean;

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
  @IsOptional()
  @IsEnum(Activity, { each: true })
  activities?: Activity[];

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  activitiesComments?: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @Length(1, 255)
  itemsInStock?: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @Length(1, 255)
  needMoreOptions?: string;

  @IsOptional()
  @IsBoolean()
  newsletterSubscription?: boolean;
}
