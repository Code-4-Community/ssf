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
  location!: string;
  additionalInformation!: string | null;
  feedbackOnPriorDonation!: string | null;
  requestedAt!: Date;
  status!: FoodRequestStatus;
  pantry!: FoodRequestPantry;
}
