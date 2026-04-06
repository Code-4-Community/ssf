import { useMemo } from 'react';
import {
  DonationItemDetailsDto,
  DonationItemsGroupedByFoodType,
} from 'types/types';

export function useGroupedDonationItemsByFoodType(
  items: DonationItemDetailsDto[] | null | undefined,
): DonationItemsGroupedByFoodType {
  return useMemo(() => {
    if (!items) return {} as DonationItemsGroupedByFoodType;

    return items.reduce((acc: DonationItemsGroupedByFoodType, item) => {
      const existing = acc[item.foodType];
      if (existing) existing.push(item);
      else acc[item.foodType] = [item];
      return acc;
    }, {} as DonationItemsGroupedByFoodType);
  }, [items]);
}
