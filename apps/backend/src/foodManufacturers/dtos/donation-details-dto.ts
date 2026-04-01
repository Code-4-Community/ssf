import { FoodType } from '../../donationItems/types';
import { Donation } from '../../donations/donations.entity';

export class DonationItemWithAllocatedQuantityDto {
  itemId!: number;
  itemName!: string;
  foodType!: FoodType;
  allocatedQuantity!: number;
}

export class DonationOrderDetailsDto {
  orderId!: number;
  pantryId!: number;
  pantryName!: string;
}

export class DonationDetailsDto {
  donation!: Donation;
  associatedPendingOrders!: DonationOrderDetailsDto[];
  relevantDonationItems!: DonationItemWithAllocatedQuantityDto[];
}
