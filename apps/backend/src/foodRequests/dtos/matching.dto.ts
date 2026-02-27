import { FoodType } from '../../donationItems/types';
import { FoodManufacturer } from '../../foodManufacturers/manufacturers.entity';

export class MatchingManufacturersDto {
  matchingManufacturers!: FoodManufacturer[];
  nonMatchingManufacturers!: FoodManufacturer[];
}

export class MatchingItemsDto {
  matchingItems!: DonationItemDetailsDto[];
  nonMatchingItems!: DonationItemDetailsDto[];
}

export class DonationItemDetailsDto {
  itemId!: number;
  itemName!: string;
  foodType!: FoodType;
  availableQuantity!: number;
}
