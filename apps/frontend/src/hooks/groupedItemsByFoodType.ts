import { useMemo } from 'react';
import { FoodType } from 'types/types';

// Groups obects by their foodType: FoodType, these objects must have a field of foodType: FoodType
export function groupedItemsByFoodType<T extends { foodType: FoodType }>(
  items: T[] | null | undefined,
): Record<string, T[]> {
  if (!items) return {};

  return items.reduce((acc: Record<string, T[]>, item) => {
    if (!acc[item.foodType]) {
      acc[item.foodType] = [];
    }
    acc[item.foodType].push(item);
    return acc;
  }, {});
}

export function useGroupedItemsByFoodType<T extends { foodType: FoodType }>(
  items: T[] | null | undefined,
): Record<string, T[]> {
  return useMemo(() => groupedItemsByFoodType(items), [items]);
}
