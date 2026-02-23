import { useMemo } from 'react';
import { FoodTypes, GroupedByFoodType, OrderItemDetails } from 'types/types';

export function useGroupedItemsByFoodType(
  source: { items: OrderItemDetails[] } | null | undefined,
): GroupedByFoodType {
  return useMemo(() => {
    if (!source) return {} as GroupedByFoodType;

    return source.items.reduce(
      (acc: Record<(typeof FoodTypes)[number], OrderItemDetails[]>, item) => {
        if (!acc[item.foodType]) acc[item.foodType] = [];
        acc[item.foodType].push(item);
        return acc;
      },
      {} as GroupedByFoodType,
    );
  }, [source]);
}
