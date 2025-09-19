export enum Role {
  ADMIN = 'admin',
  LEAD_VOLUNTEER = 'lead_volunteer',
  STANDARD_VOLUNTEER = 'standard_volunteer',
  PANTRY = 'pantry',
  FOODMANUFACTURER = 'food_manufacturer',
}

export const VOLUNTEER_ROLES: Role[] = [
  Role.LEAD_VOLUNTEER,
  Role.STANDARD_VOLUNTEER,
];

export type VolunteerType = (typeof VOLUNTEER_ROLES)[number];
