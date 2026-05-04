export enum Role {
  ADMIN = 'admin',
  VOLUNTEER = 'volunteer',
  PANTRY = 'pantry',
  FOODMANUFACTURER = 'food_manufacturer',
}

export type PendingApplication = {
  id: number;
  name: string;
  type: 'pantry' | 'food_manufacturer';
  dateApplied: Date;
};
