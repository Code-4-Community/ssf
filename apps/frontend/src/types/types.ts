export interface User {
  userId: number;
  role: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface Pantry {
  pantryId: number;
  pantryName: string;
  address: string;
  allergenClients: string;
  refrigeratedDonation: string;
  reserveFoodForAllergic: boolean;
  reservationExplanation: string;
  dedicatedAllergyFriendly: string;
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

export enum VolunteerType {
  LEAD_VOLUNTEER = 'Lead Volunteer',
  STANDARD_VOLUNTEER = 'Standard Volunteer',
  NON_PANTRY_VOLUNTEER = 'Non-pantry Volunteer',
}

export interface AssignmentWithRelations {
  assignmentId: number;
  volunteerType: VolunteerType;
  volunteer: {
    id: number;
    firstName: string;
  };
  pantry: {
    pantryId: number;
    pantryName: string;
  };
}
