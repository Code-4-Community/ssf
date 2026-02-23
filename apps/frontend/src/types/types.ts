import {
  RefrigeratedDonation,
  ReserveFoodForAllergic,
  ClientVisitFrequency,
  ServeAllergicChildren,
  AllergensConfidence,
  Activity,
} from './pantryEnums';
import {
  DonateWastedFood,
  Allergen,
  ManufacturerAttribute,
} from './manufacturerEnums';

// Note: The API calls as currently written do not
// return a pantry's SSF representative or pantry
// representative, or their IDs, as part of the
// Pantry data
export interface Pantry {
  pantryId: number;
  pantryName: string;
  shippingAddressLine1: string;
  shippingAddressLine2?: string;
  shippingAddressCity: string;
  shippingAddressState: string;
  shippingAddressZip: string;
  shippingAddressCountry?: string;
  mailingAddressLine1: string;
  mailingAddressLine2?: string;
  mailingAddressCity: string;
  mailingAddressState: string;
  mailingAddressZip: string;
  mailingAddressCountry?: string;
  allergenClients: string;
  refrigeratedDonation: RefrigeratedDonation;
  acceptFoodDeliveries: boolean;
  deliveryWindowInstructions?: string;
  reserveFoodForAllergic: ReserveFoodForAllergic;
  reservationExplanation?: string;
  dedicatedAllergyFriendly: boolean;
  clientVisitFrequency?: ClientVisitFrequency;
  identifyAllergensConfidence?: AllergensConfidence;
  serveAllergicChildren?: ServeAllergicChildren;
  newsletterSubscription: boolean;
  restrictions: string[];
  hasEmailContact: boolean;
  emailContactOther?: string;
  secondaryContactFirstName?: string;
  secondaryContactLastName?: string;
  secondaryContactEmail?: string;
  secondaryContactPhone?: string;
  pantryUser?: User;
  status: ApplicationStatus;
  dateApplied: string;
  activities: Activity[];
  activitiesComments?: string;
  itemsInStock: string;
  needMoreOptions: string;
  volunteers?: User[];
}

export interface PantryApplicationDto {
  contactFirstName: string;
  contactLastName: string;
  contactEmail: string;
  contactPhone: string;
  hasEmailContact: boolean;
  emailContactOther?: string;
  secondaryContactFirstName?: string;
  secondaryContactLastName?: string;
  secondaryContactEmail?: string;
  secondaryContactPhone?: string;
  pantryName: string;
  shippingAddressLine1: string;
  shippingAddressLine2?: string;
  shippingAddressCity: string;
  shippingAddressState: string;
  shippingAddressZip: string;
  shippingAddressCountry?: string;
  mailingAddressLine1: string;
  mailingAddressLine2?: string;
  mailingAddressCity: string;
  mailingAddressState: string;
  mailingAddressZip: string;
  mailingAddressCountry?: string;
  allergenClients: string;
  restrictions?: string[];
  refrigeratedDonation: RefrigeratedDonation;
  acceptFoodDeliveries: boolean;
  deliveryWindowInstructions?: string;
  reserveFoodForAllergic: ReserveFoodForAllergic;
  reservationExplanation?: string;
  dedicatedAllergyFriendly: boolean;
  clientVisitFrequency?: ClientVisitFrequency;
  identifyAllergensConfidence?: AllergensConfidence;
  serveAllergicChildren?: ServeAllergicChildren;
  activities: Activity[];
  activitiesComments?: string;
  itemsInStock: string;
  needMoreOptions: string;
  newsletterSubscription?: string;
}

export enum DonationStatus {
  MATCHED = 'matched',
  AVAILABLE = 'available',
  FULFILLED = 'fulfilled',
}

export enum RecurrenceEnum {
  NONE = 'none',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

export interface Donation {
  donationId: number;
  dateDonated: string;
  status: DonationStatus;
  totalItems: number;
  totalOz: number;
  totalEstimatedValue: number;
  foodManufacturer?: FoodManufacturer;
  recurrence: RecurrenceEnum;
  recurrenceFreq?: number;
  nextDonationDates?: string[];
  occurrencesRemaining?: number;
}

export interface DonationItem {
  itemId: number;
  donationId: number;
  itemName: string;
  quantity: number;
  reservedQuantity: number;
  ozPerItem?: number;
  estimatedValue?: number;
  foodType: FoodType;
  foodRescue?: boolean;
}

export enum FoodType {
  DAIRY_FREE_ALTERNATIVES = 'Dairy-Free Alternatives',
  DRIED_BEANS = 'Dried Beans (Gluten-Free, Nut-Free)',
  GLUTEN_FREE_BAKING_PANCAKE_MIXES = 'Gluten-Free Baking/Pancake Mixes',
  GLUTEN_FREE_BREAD = 'Gluten-Free Bread',
  GLUTEN_FREE_TORTILLAS = 'Gluten-Free Tortillas',
  GRANOLA = 'Granola',
  MASA_HARINA_FLOUR = 'Masa Harina Flour',
  NUT_FREE_GRANOLA_BARS = 'Nut-Free Granola Bars',
  OLIVE_OIL = 'Olive Oil',
  REFRIGERATED_MEALS = 'Refrigerated Meals',
  RICE_NOODLES = 'Rice Noodles',
  SEED_BUTTERS = 'Seed Butters (Peanut Butter Alternative)',
  WHOLE_GRAIN_COOKIES = 'Whole-Grain Cookies',
  QUINOA = 'Quinoa',
}

export interface User {
  id: number;
  role: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  pantries?: Pantry[];
}

export interface UserDto {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: Role;
}

export interface FoodRequest {
  requestId: number;
  pantryId: number;
  pantry: Pantry;
  requestedSize: string;
  requestedFoodTypes: FoodType[];
  additionalInformation: string | null;
  requestedAt: string;
  dateReceived: string | null;
  feedback: string | null;
  photos: string[] | null;
  orders?: Order[];
}

export interface Order {
  orderId: number;
  request: FoodRequest;
  requestId: number;
  foodManufacturer: FoodManufacturer;
  foodManufacturerId: number;
  status: OrderStatus;
  createdAt: string;
  shippedAt?: Date;
  deliveredAt?: Date;
  allocations: Allocation[];
  trackingLink?: string;
  shippingCost?: number;
}

export interface OrderItemDetails {
  name: string;
  quantity: number;
  foodType: FoodType;
}

export interface OrderDetails {
  orderId: number;
  status: OrderStatus;
  foodManufacturerName: string;
  items: OrderItemDetails[];
}

export interface FoodManufacturer {
  foodManufacturerId: number;
  foodManufacturerName: string;
  foodManufacturerRepresentative?: User;
}

export interface ManufacturerApplicationDto {
  foodManufacturerName: string;
  foodManufacturerWebsite: string;
  contactFirstName: string;
  contactLastName: string;
  contactEmail: string;
  contactPhone: string;
  secondaryContactFirstName?: string;
  secondaryContactLastName?: string;
  secondaryContactEmail?: string;
  secondaryContactPhone?: string;
  unlistedProductAllergens: Allergen[];
  facilityFreeAllergens: Allergen[];
  productsGlutenFree: boolean;
  productsContainSulfites: boolean;
  productsSustainableExplanation: string;
  inKindDonations: boolean;
  donateWastedFood: DonateWastedFood;
  manufacturerAttribute?: ManufacturerAttribute;
  additionalComments?: string;
  newsletterSubscription?: boolean;
}

export interface CreateFoodRequestBody {
  pantryId: number;
  requestedSize: string;
  requestedFoodTypes: FoodType[];
  additionalInformation: string | null | undefined;
  dateReceived: string | null | undefined;
  feedback: string | null | undefined;
  photos: string[] | null | undefined;
}

export interface CreateMultipleDonationItemsBody {
  donationId: number;
  items: {
    itemName: string;
    quantity: number;
    reservedQuantity: number;
    ozPerItem?: number;
    estimatedValue?: number;
    foodType: FoodType;
    foodRescue?: boolean;
  }[];
}

export interface Allocation {
  allocationId: number;
  orderId: number;
  itemId: number;
  item: DonationItem;
  allocatedQuantity: number;
}

export enum Role {
  ADMIN = 'admin',
  VOLUNTEER = 'volunteer',
  PANTRY = 'pantry',
  FOODMANUFACTURER = 'food_manufacturer',
}

export enum OrderStatus {
  PENDING = 'pending',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
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

export interface OrderSummary {
  orderId: number;
  status: OrderStatus;
  createdAt: string;
  shippedAt?: string;
  deliveredAt?: string;
  request: {
    pantryId: number;
    pantry: {
      pantryName: string;
      volunteers?: {
        id: number;
        firstName: string;
        lastName: string;
      }[];
    };
  };
}

export enum ApplicationStatus {
  APPROVED = 'approved',
  DENIED = 'denied',
  PENDING = 'pending',
}

export type DayOfWeek =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday';

export type RepeatOnState = Record<DayOfWeek, boolean>;
