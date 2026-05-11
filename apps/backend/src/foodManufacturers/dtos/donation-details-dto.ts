import { FoodType } from '../../donationItems/types';
import { Donation } from '../../donations/donations.entity';

export class DonationItemWithAllocatedQuantityDto {
  itemId!: number;
  itemName!: string;
  foodType!: FoodType;
  allocatedQuantity!: number;
  ozPerItem?: number;
  estimatedValue?: number;
  foodRescue!: boolean;
}

export class PendingOrderItemDto {
  id!: number;
  name!: string;
  quantity!: number;
  foodType!: FoodType;
}

export class DonationOrderDetailsDto {
  orderId!: number;
  pantryId!: number;
  pantryName!: string;
  trackingLink!: string | null;
  shippingCost!: number | null;
  items!: PendingOrderItemDto[];
}

export class DonationDetailsDto {
  donation!: Donation;
  associatedPendingOrders!: DonationOrderDetailsDto[];
  relevantDonationItems!: DonationItemWithAllocatedQuantityDto[];
}

export class DonationReminderDto {
  donation!: Donation;
  reminderDate!: Date;
}
