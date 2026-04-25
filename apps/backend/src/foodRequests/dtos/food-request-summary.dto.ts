import { FoodType } from '../../donationItems/types';
import { FoodRequestStatus, RequestSize } from '../types';

export class FoodRequestPantry {
  pantryId!: number;
  pantryName!: string;
}

export class FoodRequestSummaryDto {
  requestId!: number;
  requestedSize!: RequestSize;
  requestedFoodTypes!: FoodType[];
  additionalInformation!: string | null;
  requestedAt!: Date;
  status!: FoodRequestStatus;
  pantry!: FoodRequestPantry;
}
