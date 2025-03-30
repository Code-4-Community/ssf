export interface Donation {
  donationId: number;
  foodManufacturerId: number;
  dateDonated: string;
  status: string;
  totalItems: number;
  totalOz: number;
  totalEstimatedValue: number;
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
  userId: number;
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
  status: string;
  fulfilledBy: string | null;
  dateReceived: string | null;
  requestedSize: string;
  requestedItems: string[];
  additionalInformation: string;
}
