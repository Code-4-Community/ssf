import { FoodType } from '../../donationItems/types';

export class OrderDonationItemDto {
  itemId!: number;
  itemName!: string;
  foodType!: FoodType;
  quantity!: number;
  reservedQuantity!: number;
}
