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
