import { DonationItem } from '../donationItems/donationItems.entity';
import { OrderStatus } from '../orders/types';

export function isDonationFulfillable(items: DonationItem[]): boolean {
  const allItemsFulfilled = items.every(
    (item) => item.detailsConfirmed && item.reservedQuantity === item.quantity,
  );
  if (!allItemsFulfilled) return false;

  const hasPendingOrder = items.some((item) =>
    item.allocations.some(
      (allocation) => allocation.order.status === OrderStatus.PENDING,
    ),
  );
  return !hasPendingOrder;
}
