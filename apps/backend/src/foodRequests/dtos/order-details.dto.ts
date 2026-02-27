import { FoodType } from '../../donationItems/types';
import { OrderStatus } from '../../orders/types';

export class OrderItemDetailsDto {
  id: number;
  name: string;
  quantity: number;
  foodType: FoodType;
}

export class OrderDetailsDto {
  orderId: number;
  status: OrderStatus;
  foodManufacturerName: string;
  trackingLink: string | null;
  items: OrderItemDetailsDto[];
}
