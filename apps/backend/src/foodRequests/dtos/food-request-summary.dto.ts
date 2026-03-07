import { FoodRequestStatus, RequestSize } from '../../foodRequests/types';

export class FoodRequestSummaryDto {
  requestId!: number;
  pantryId!: number;
  pantryName!: string;
  requestedSize!: RequestSize;
  requestedItems!: string[];
  additionalInformation!: string | null;
  requestedAt!: Date;
  status!: FoodRequestStatus;
}
