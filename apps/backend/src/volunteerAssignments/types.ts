import { Role } from '../users/types';

export const VOLUNTEER_ROLES: Role[] = [
  Role.LEAD_VOLUNTEER,
  Role.STANDARD_VOLUNTEER,
  Role.NON_PANTRY_VOLUNTEER,
];

export type VolunteerType = (typeof VOLUNTEER_ROLES)[number];
