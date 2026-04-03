import { OrderStatus } from '../orders/types';
import { User } from '../users/users.entity';

export type Assignments = Omit<User, 'pantries'> & { pantryIds: number[] };

export type VolunteerOrder = {
  orderId: number;
  status: OrderStatus;
  createdAt: Date;
  shippedAt: Date | null;
  deliveredAt: Date | null;
  pantryName: string;
  assignee: User;
  requiredActions: RequiredVolunteerAction | undefined;
};

export type RequiredVolunteerAction = {
  confirmDonationReceipt: boolean;
  notifyPantry: boolean;
};
