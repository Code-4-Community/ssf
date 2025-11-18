import {
  ArrayNotEmpty,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Length,
  MaxLength,
} from 'class-validator';

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

  @IsIn(['Yes', 'Small quantities only', 'No'])
  refrigeratedDonation: string;

  @IsIn(['Yes', 'Some', 'No'])
  reserveFoodForAllergic: string;

  // TODO: Really, this validation should be different depending on the value of reserveFoodForAllergic
  @IsOptional()
  @IsString()
  reservationExplanation?: string;

  @IsIn([
    'Yes, we have a dedicated shelf or box',
    'Yes, we keep allergy-friendly items in a back room',
    'No, we keep allergy-friendly items throughout the pantry, depending on the type of item',
  ])
  dedicatedAllergyFriendly: string;

  @IsOptional()
  @IsIn([
    'Daily',
    'More than once a week',
    'Once a week',
    'A few times a month',
    'Once a month',
  ])
  clientVisitFrequency?: string;

  @IsOptional()
  @IsIn([
    'Very confident',
    'Somewhat confident',
    'Not very confident (we need more education!)',
  ])
  identifyAllergensConfidence?: string;

  @IsOptional()
  @IsIn(['Yes, many (> 10)', 'Yes, a few (< 10)', 'No'])
  serveAllergicChildren?: string;

  @ArrayNotEmpty()
  @IsIn(
    [
      'Create a labeled, allergy-friendly shelf or shelves',
      'Provide clients and staff/volunteers with educational pamphlets',
      "Use a spreadsheet to track clients' medical dietary needs and distribution of SSF items per month",
      'Post allergen-free resource flyers throughout pantry',
      'Survey your clients to determine their medical dietary needs',
      'Collect feedback from allergen-avoidant clients on SSF foods',
      'Something else',
    ],
    { each: true },
  )
  activities: string[];

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
  @IsIn(['Yes', 'No'])
  newsletterSubscription?: string;
}
