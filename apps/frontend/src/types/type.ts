export interface User {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
}

export interface Pantry {
  pantryId: number;
  pantryName: string;
  address: string;
  allergenClients: string | null;
  refrigeratedDonation: string | null;
  reserveFoodForAllergic: boolean;
  reservationExplanation: string;
  dedicatedAllergenFriendly: string;
  clientVisitFrequency: string;
  identifyAllergensConfidence: string;
  serveAllergicChildren: string;
  newsletterSubscription: boolean;
  restrictions: string[];
  ssfRepresentativeId: number;
  pantryRepresentativeId: number;
  status: string;
  dateApplied: string;
  activities: string;
  questions: string;
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
