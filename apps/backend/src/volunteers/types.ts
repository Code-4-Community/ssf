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
  assignee: OrderAssignee;
  actionCompletion?: VolunteerActionCompletion;
};

export type VolunteerActionCompletion = {
  confirmDonationReceipt: boolean;
  notifyPantry: boolean;
};

export type OrderAssignee = {
  id: number;
  firstName: string;
  lastName: string;
};
