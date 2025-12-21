export interface LimitedPantryInfo {
  pantryId: number;
  pantryName: string;
}

export interface Assignments {
  assignmentId: number;
  volunteer: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    role: string;
  };
  pantry: LimitedPantryInfo | null;
}

