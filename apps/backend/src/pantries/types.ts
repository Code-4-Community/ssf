export interface ApprovedPantryResponse {
  pantryId: number;
  pantryName: string;
  address: {
    line1: string;
    line2: string | null;
    city: string;
    state: string;
    zip: string;
    country: string | null;
  };
  contactInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  refrigeratedDonation: string;
  allergenClients: string;
  status: string;
  dateApplied: Date;
  assignedVolunteers: AssignedVolunteer[];
}

export interface AssignedVolunteer {
  assignmentId: number;
  userId: number;
  name: string;
  email: string;
  phone: string;
  role: string;
}
