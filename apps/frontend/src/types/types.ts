import {
  RefrigeratedDonation,
  ReserveFoodForAllergic,
  ClientVisitFrequency,
  ServeAllergicChildren,
  AllergensConfidence,
  PantryStatus,
  Activity,
} from './pantryEnums';

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
  status: PantryStatus;
  dateApplied: Date;
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

export interface Donation {
  donationId: number;
  dateDonated: string;
  status: DonationStatus;
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
  requestedAt: string;
  dateReceived: string | null;
  requestedSize: string;
  requestedItems: string[];
  additionalInformation: string;
  orderId: number;
  orders?: Order[];
}

export interface Order {
  orderId: number;
  pantry?: Pantry;
  request: FoodRequest;
  requestId: number;
  foodManufacturer: FoodManufacturer | null;
  shippedBy: number | null;
  status: OrderStatus;
  createdAt: string;
  shippedAt: string | null;
  deliveredAt: string | null;
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
}

export enum Role {
  ADMIN = 'admin',
  VOLUNTEER = 'volunteer',
  PANTRY = 'pantry',
  FOODMANUFACTURER = 'food_manufacturer',
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

export interface OrderSummary {
  orderId: number;
  status: OrderStatus;
  createdAt: string;
  shippedAt: string | null;
  deliveredAt: string | null;
  pantry: {
    pantryName: string;
    volunteers?: {
      id: number;
      firstName: string;
      lastName: string;
    }[];
  };
}
