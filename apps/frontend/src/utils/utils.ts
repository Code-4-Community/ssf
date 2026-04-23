import {
  DayOfWeek,
  RecurrenceEnum,
  RepeatOnState,
  OrderStatus,
  DonationStatus,
} from '../types/types';

export const YELLOW_STATUS: [string, string] = ['yellow.200', 'yellow.hover'];
export const BLUE_STATUS: [string, string] = ['blue.100', 'blue.core'];
export const TEAL_STATUS: [string, string] = ['teal.200', 'teal.hover'];

// color mapping for order/donation statuses, the first color is background, the second is color for status text
export const ORDER_STATUS_COLORS: Record<OrderStatus, [string, string]> = {
  [OrderStatus.SHIPPED]: YELLOW_STATUS,
  [OrderStatus.PENDING]: BLUE_STATUS,
  [OrderStatus.DELIVERED]: TEAL_STATUS,
};

export const DONATION_STATUS_COLORS: Record<DonationStatus, [string, string]> =
  {
    [DonationStatus.MATCHED]: YELLOW_STATUS,
    [DonationStatus.AVAILABLE]: BLUE_STATUS,
    [DonationStatus.FULFILLED]: TEAL_STATUS,
  };

export const formatPhone = (phone?: string | null) => {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return phone;
};

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US');
};

export const formatReceivedDate = (dateString: string | null) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date
    .toISOString()
    .split('T')[0]
    .replace(/(\d{4})-(\d{2})-(\d{2})/, '$2/$3/$1');
};

export const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const generateNextDonationDate = (
  repeatEvery: string,
  repeatInterval: RecurrenceEnum,
  repeatOn: RepeatOnState,
): string | null => {
  const today = new Date();
  const repeatCount = parseInt(repeatEvery);

  if (repeatInterval === RecurrenceEnum.WEEKLY) {
    const selectedDays = (Object.keys(repeatOn) as DayOfWeek[]).filter(
      (day) => repeatOn[day],
    );
    if (selectedDays.length === 0) return null;

    const daysOfWeek: DayOfWeek[] = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];

    const startOffset = repeatCount > 1 ? repeatCount * 7 : 1;

    for (let i = startOffset; i <= startOffset + 6; i++) {
      const nextDay = daysOfWeek[(today.getDay() + i) % 7];
      if (selectedDays.includes(nextDay)) {
        const next = new Date(today);
        next.setDate(today.getDate() + i);
        return next.toISOString();
      }
    }
    return null;
  }

  const next = new Date(today);
  // Date clamp back to 28 for monthly and yearly
  if (next.getDate() > 28) next.setDate(28);
  if (repeatInterval === RecurrenceEnum.MONTHLY) {
    next.setMonth(today.getMonth() + repeatCount);
  } else if (repeatInterval === RecurrenceEnum.YEARLY) {
    next.setFullYear(today.getFullYear() + repeatCount);
  } else {
    return null;
  }
  return next.toISOString();
};

export const getInitials = (first: string, last: string) =>
  `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase();

export const ASSIGNEE_COLORS = ['yellow.core', 'red', 'teal.ssf', 'blue.ssf'];
