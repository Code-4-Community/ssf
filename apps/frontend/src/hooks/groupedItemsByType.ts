import { useMemo } from 'react';
import { FoodTypes, GroupedByFoodType, OrderItemDetails } from 'types/types';

export function useGroupedItemsByFoodType(
  items: OrderItemDetails[] | null | undefined,
): GroupedByFoodType {
  return useMemo(() => {
    if (!items) return {} as GroupedByFoodType;

    return items.reduce(
      (acc: Record<(typeof FoodTypes)[number], OrderItemDetails[]>, item) => {
        if (!acc[item.foodType]) acc[item.foodType] = [];
        acc[item.foodType].push(item);
        return acc;
      },
      {} as GroupedByFoodType,
    );
  }, [items]);
}
