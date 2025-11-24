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

