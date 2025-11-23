export interface Donation {
  donationId: number;
  dateDonated: string;
  status: string;
  totalItems: number;
  totalOz: number;
  totalEstimatedValue: number;
  foodManufacturer?: FoodManufacturer;
}

export interface DonationItem {
  itemId: number;
  donationId: number;
  itemName: string;
  quantity: number;
  reservedQuantity: number;
  status: string;
  ozPerItem: number;
  estimatedValue: number;
  foodType: string;
}

export const FoodTypes = [
  'Dairy-Free Alternatives',
  'Dried Beans (Gluten-Free, Nut-Free)',
  'Gluten-Free Baking/Pancake Mixes',
  'Gluten-Free Bread',
  'Gluten-Free Tortillas',
  'Granola',
  'Masa Harina Flour',
  'Nut-Free Granola Bars',
  'Olive Oil',
  'Refrigerated Meals',
  'Rice Noodles',
  'Seed Butters (Peanut Butter Alternative)',
  'Whole-Grain Cookies',
  'Quinoa',
] as const;

export interface User {
  id: number;
  role: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

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
  refrigeratedDonation: string;
  reserveFoodForAllergic: string;
  reservationExplanation?: string;
  dedicatedAllergyFriendly: string;
  clientVisitFrequency?: string;
  identifyAllergensConfidence?: string;
  serveAllergicChildren?: string;
  activities: string[];
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
  refrigeratedDonation: string;
  reserveFoodForAllergic: string;
  reservationExplanation?: string;
  dedicatedAllergyFriendly: string;
  clientVisitFrequency?: string;
  identifyAllergensConfidence?: string;
  serveAllergicChildren?: string;
  newsletterSubscription: boolean;
  restrictions: string[];
  status: string;
  dateApplied: string;
  activities: string[];
  activitiesComments?: string;
  itemsInStock: string;
  needMoreOptions: string;
}

export interface FoodRequest {
  requestId: number;
  requestedAt: string;
  dateReceived: string | null;
  requestedSize: string;
  requestedItems: string[];
  additionalInformation: string;
  orderId: number;
  order?: Order;
}

export interface Order {
  orderId: number;
  requestId: number;
  pantryId: number;
  foodManufacturer: FoodManufacturer;
  shippedBy: number | null;
  status: string;
  createdAt: string;
  shippedAt: string;
  deliveredAt: string;
  donationId: number;
}

export interface FoodManufacturer {
  foodManufacturerId: number;
  foodManufacturerName: string;
  foodManufacturerRepresentative?: User;
}

export interface CreateFoodRequestBody {
  pantryId: number;
  requestedSize: string;
  requestedItems: string[];
  additionalInformation: string | null | undefined;
  status: string;
  fulfilledBy: number | null | undefined;
  dateReceived: Date | null | undefined;
  feedback: string | null | undefined;
  photos: string[] | null | undefined;
}

export interface Allocation {
  allocationId: number;
  orderId: number;
  itemId: number;
  item: DonationItem;
  allocatedQuantity: number;
  reservedAt: string;
  fulfilledAt: string;
  status: string;
}

export enum VolunteerType {
  LEAD_VOLUNTEER = 'lead_volunteer',
  STANDARD_VOLUNTEER = 'standard_volunteer',
}

export interface VolunteerPantryAssignment {
  assignmentId: number;
  volunteer: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    role: string;
  };
  pantry: {
    pantryId: number;
    pantryName: string;
  };
}

export enum Role {
  ADMIN = 'admin',
  LEAD_VOLUNTEER = 'lead_volunteer',
  STANDARD_VOLUNTEER = 'standard_volunteer',
  PANTRY = 'pantry',
  FOODMANUFACTURER = 'food_manufacturer',
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

export enum Activities {
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

export enum OrderStatus {
  DELIVERED = 'delivered',
  PENDING = 'pending',
  SHIPPED = 'shipped',
}

export enum RequestSize {
  VERY_SMALL = 'Very Small (1-2 boxes)',
  SMALL = 'Small (2-5 boxes)',
  MEDIUM = 'Medium (5-10 boxes)',
  LARGE = 'Large (10+ boxes)',
}

export enum DonationFrequency {
  YEARLY = 'yearly',
  BIWEEKLY = 'biweekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  WEEKLY = 'weekly',
}

export enum DonationStatus {
  AVAILABLE = 'available',
  FULFILLED = 'fulfilled',
  MATCHING = 'matching',
}

