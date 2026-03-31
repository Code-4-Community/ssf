import { DonationItem } from '../donationItems/donationItems.entity';
import { OrderStatus } from '../orders/types';
import { isDonationFulfillable } from './donation.utils';

const makeItem = (overrides: Partial<DonationItem> = {}): DonationItem =>
  ({
    detailsConfirmed: true,
    quantity: 10,
    reservedQuantity: 10,
    allocations: [],
    ...overrides,
  } as DonationItem);

const makeAllocation = (status: OrderStatus) => ({
  order: { status },
});

describe('isDonationFulfillable', () => {
  it('returns true when all items are confirmed, fully reserved, and have no allocations', () => {
    const items = [makeItem(), makeItem()];
    expect(isDonationFulfillable(items)).toBe(true);
  });

  it('returns false when an item is not details confirmed', () => {
    const items = [makeItem(), makeItem({ detailsConfirmed: false })];
    expect(isDonationFulfillable(items)).toBe(false);
  });

  it('returns false when an item is not fully reserved', () => {
    const items = [makeItem(), makeItem({ quantity: 10, reservedQuantity: 5 })];
    expect(isDonationFulfillable(items)).toBe(false);
  });

  it('returns false when both detailsConfirmed is false and reservedQuantity does not match', () => {
    const items = [
      makeItem({ detailsConfirmed: false, quantity: 10, reservedQuantity: 3 }),
    ];
    expect(isDonationFulfillable(items)).toBe(false);
  });

  it('returns false when an item has a pending order', () => {
    const items = [
      makeItem({
        allocations: [makeAllocation(OrderStatus.PENDING)] as any,
      }),
    ];
    expect(isDonationFulfillable(items)).toBe(false);
  });

  it('returns true when all orders are delivered', () => {
    const items = [
      makeItem({
        allocations: [makeAllocation(OrderStatus.DELIVERED)] as any,
      }),
    ];
    expect(isDonationFulfillable(items)).toBe(true);
  });

  it('returns true when all orders are shipped', () => {
    const items = [
      makeItem({
        allocations: [makeAllocation(OrderStatus.SHIPPED)] as any,
      }),
    ];
    expect(isDonationFulfillable(items)).toBe(true);
  });

  it('returns false when only one of multiple items has a pending order', () => {
    const items = [
      makeItem({ allocations: [makeAllocation(OrderStatus.DELIVERED)] as any }),
      makeItem({ allocations: [makeAllocation(OrderStatus.PENDING)] as any }),
    ];
    expect(isDonationFulfillable(items)).toBe(false);
  });

  it('returns false when one item is unconfirmed and another has a pending order', () => {
    const items = [
      makeItem({ detailsConfirmed: false }),
      makeItem({ allocations: [makeAllocation(OrderStatus.PENDING)] as any }),
    ];
    expect(isDonationFulfillable(items)).toBe(false);
  });
});
