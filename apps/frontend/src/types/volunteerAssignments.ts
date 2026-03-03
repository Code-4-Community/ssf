import { User } from './types';

export interface LimitedPantryInfo {
  pantryId: number;
  pantryName: string;
}

export type Assignments = Omit<User, 'pantries'> & { pantryIds: number[] };
