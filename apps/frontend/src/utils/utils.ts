import { RecurrenceEnum } from '../types/types';
import {
  DayOfWeek,
  RepeatOnState,
} from '../components/forms/newDonationFormModal';

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
