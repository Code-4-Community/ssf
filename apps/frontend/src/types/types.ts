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
