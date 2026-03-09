import { FoodType } from '../../donationItems/types';
import { FoodRequestStatus, RequestSize } from '../../foodRequests/types';

export class FoodRequestSummaryDto {
  requestId!: number;
  pantryId!: number;
  pantryName!: string;
  requestedSize!: RequestSize;
  requestedFoodTypes!: FoodType[];
  additionalInformation!: string | null;
  requestedAt!: Date;
  status!: FoodRequestStatus;
}
