import { RequestSize } from '../../foodRequests/types';

export class FoodRequestSummaryDto {
  requestId!: number;
  pantryId!: number;

  pantryName!: string;

  requestedSize!: RequestSize;
  requestedItems!: string[];

  additionalInformation!: string | null;

  requestedAt!: Date;
  dateReceived!: Date | null;

  feedback!: string | null;
  photos!: string[] | null;
}
