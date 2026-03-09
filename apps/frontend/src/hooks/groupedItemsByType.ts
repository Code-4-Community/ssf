import { useMemo } from 'react';
import { GroupedByFoodType, OrderItemDetails } from 'types/types';

export function useGroupedItemsByFoodType(
  items: OrderItemDetails[] | null | undefined,
): GroupedByFoodType {
  return useMemo(() => {
    if (!items) return {} as GroupedByFoodType;

    return items.reduce((acc: GroupedByFoodType, item) => {
      const existing = acc[item.foodType];
      if (existing) existing.push(item);
      else acc[item.foodType] = [item];
      return acc;
    }, {} as GroupedByFoodType);
  }, [items]);
}
