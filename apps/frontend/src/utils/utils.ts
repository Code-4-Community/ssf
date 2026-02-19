import {
  DayOfWeek,
  RepeatEnum,
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

export const generateNextDonationDates = (
  repeatEvery: string,
  repeatInterval: RepeatEnum,
  repeatOn: RepeatOnState,
): string[] => {
  const today = new Date();
  const repeatCount = parseInt(repeatEvery);
  const dates: string[] = [];

  if (repeatInterval === RepeatEnum.WEEK) {
    const selectedDays = (Object.keys(repeatOn) as DayOfWeek[]).filter(
      (day) => repeatOn[day],
    );
    if (selectedDays.length === 0) return [];

    const dayOfWeek = today.getDay();
    const daysOfWeek: DayOfWeek[] = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];

    const baseWeeksToAdd = repeatCount;
    const baseDaysToAdd = baseWeeksToAdd * 7;
    const startDay = repeatCount > 1 ? baseDaysToAdd : 1;

    for (let i = startDay; i <= startDay + 6; i++) {
      const nextDayIndex = (dayOfWeek + i) % 7;
      const nextDay = daysOfWeek[nextDayIndex];

      if (selectedDays.includes(nextDay)) {
        const nextDate = new Date(today);
        nextDate.setDate(today.getDate() + i);
        nextDate.setHours(
          today.getHours(),
          today.getMinutes(),
          today.getSeconds(),
          today.getMilliseconds(),
        );
        dates.push(nextDate.toISOString());
      }
    }
  } else if (repeatInterval === RepeatEnum.MONTH) {
    const nextDate = new Date(today);
    nextDate.setMonth(today.getMonth() + repeatCount);
    nextDate.setHours(
      today.getHours(),
      today.getMinutes(),
      today.getSeconds(),
      today.getMilliseconds(),
    );
    dates.push(nextDate.toISOString());
  } else if (repeatInterval === RepeatEnum.YEAR) {
    const nextDate = new Date(today);
    nextDate.setFullYear(today.getFullYear() + repeatCount);
    nextDate.setHours(
      today.getHours(),
      today.getMinutes(),
      today.getSeconds(),
      today.getMilliseconds(),
    );
    dates.push(nextDate.toISOString());
  }

  return dates;
};
