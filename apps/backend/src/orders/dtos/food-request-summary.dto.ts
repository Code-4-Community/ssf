import { FoodRequestStatus, RequestSize } from '../../foodRequests/types';

export class FoodRequestSummaryDto {
  requestId!: number;
  pantryId!: number;
  pantryName!: string;
  requestedSize!: RequestSize;
  requestedItems!: string[];
  additionalInformation?: string;
  requestedAt!: Date;
  status!: FoodRequestStatus;
}
