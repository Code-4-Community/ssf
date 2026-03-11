import { User } from '../users/users.entity';

export type Assignments = Omit<User, 'pantries'> & { pantryIds: number[] };
