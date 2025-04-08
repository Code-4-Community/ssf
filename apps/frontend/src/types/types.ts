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
  foodManufacturerRepresentativeId: number;
}

export interface Donation {
  donationId: number;
  foodManufacturerId: number;
  dateDonated: Date;
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
