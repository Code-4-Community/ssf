export interface PantryApplicationDto {
  contactFirstName: string;
  contactLastName: string;
  contactEmail: string;
  contactPhone: string;
  pantryName: string;
  addressLine1: string;
  addressLine2?: string;
  addressCity: string;
  addressState: string;
  addressZip: string;
  addressCountry?: string;
  allergenClients: string;
  restrictions?: string[];
  refrigeratedDonation: RefrigeratedDonation;
  reserveFoodForAllergic: ReserveFoodForAllergic;
  reservationExplanation?: string;
  dedicatedAllergyFriendly: AllergyFriendlyStorage;
  clientVisitFrequency?: ClientVisitFrequency;
  identifyAllergensConfidence?: AllergensConfidence;
  serveAllergicChildren?: ServeAllergicChildren;
  activities: Activity[];
  activitiesComments?: string;
  itemsInStock: string;
  needMoreOptions: string;
  newsletterSubscription?: string;
}

// Note: The API calls as currently written do not
// return a pantry's SSF representative or pantry
// representative, or their IDs, as part of the
// Pantry data
export interface Pantry {
  pantryId: number;
  pantryName: string;
  addressLine1: string;
  addressLine2?: string;
  addressCity: string;
  addressState: string;
  addressZip: string;
  addressCountry?: string;
  allergenClients: string;
  refrigeratedDonation: RefrigeratedDonation;
  reserveFoodForAllergic: ReserveFoodForAllergic;
  reservationExplanation?: string;
  dedicatedAllergyFriendly: AllergyFriendlyStorage;
  clientVisitFrequency?: ClientVisitFrequency;
  identifyAllergensConfidence?: AllergensConfidence;
  serveAllergicChildren?: ServeAllergicChildren;
  newsletterSubscription: boolean;
  restrictions: string[];
  status: PantryStatus;
  dateApplied: string;
  activities: Activity[];
  activitiesComments?: string;
  itemsInStock: string;
  needMoreOptions: string;
}

export enum RefrigeratedDonation {
  YES = 'Yes, always',
  NO = 'No',
  SOMETIMES = 'Sometimes (check in before sending)',
}

export enum ClientVisitFrequency {
  DAILY = 'Daily',
  MORE_THAN_ONCE_A_WEEK = 'More than once a week',
  ONCE_A_WEEK = 'Once a week',
  FEW_TIMES_A_MONTH = 'A few times a month',
  ONCE_A_MONTH = 'Once a month',
}

export enum AllergensConfidence {
  VERY_CONFIDENT = 'Very confident',
  SOMEWHAT_CONFIDENT = 'Somewhat confident',
  NOT_VERY_CONFIDENT = 'Not very confident (we need more education!)',
}

export enum ServeAllergicChildren {
  YES_MANY = 'Yes, many (> 10)',
  YES_FEW = 'Yes, a few (< 10)',
  NO = 'No',
}

export enum PantryStatus {
  APPROVED = 'approved',
  DENIED = 'denied',
  PENDING = 'pending',
}

export enum AllergyFriendlyStorage {
  DEDICATED_SHELF_OR_BOX = 'Yes, dedicated shelf',
  BACK_ROOM = 'Yes, back room',
  THROUGHOUT_PANTRY = 'No, throughout pantry',
}

export enum Activity {
  CREATE_LABELED_SHELF = 'Create a labeled, allergy-friendly shelf or shelves',
  PROVIDE_EDUCATIONAL_PAMPHLETS = 'Provide clients and staff/volunteers with educational pamphlets',
  TRACK_DIETARY_NEEDS = "Use a spreadsheet to track clients' medical dietary needs and distribution of SSF items per month",
  POST_RESOURCE_FLYERS = 'Post allergen-free resource flyers throughout pantry',
  SURVEY_CLIENTS = 'Survey your clients to determine their medical dietary needs',
  COLLECT_FEEDBACK = 'Collect feedback from allergen-avoidant clients on SSF foods',
  SOMETHING_ELSE = 'Something else',
}

export enum ReserveFoodForAllergic {
  YES = 'Yes',
  SOME = 'Some',
  NO = 'No',
}