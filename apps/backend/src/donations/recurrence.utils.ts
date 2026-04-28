import { RecurrenceEnum } from './types';

/**
 * Calculates next single donation date from a given currentDate during recurring donation processing
 *
 * used by handleRecurringDonations to determine the replacement date when an occurrence is processed
 * unlike generateNextDonationDates, this always returns exactly one date and doesn't consider
 *  multiple selected days for weekly recurrence
 *
 * for MONTHLY/YEARLY recurrence, dates > 28 are clamped to 28 before adding the interval to
 *  prevent date rollover
 *
 * @param currentDate - date to calculate from
 * @param recurrence - recurrence type (WEEKLY, MONTHLY, YEARLY, or NONE)
 * @param recurrenceFreq - how many weeks/months/years to add (defaults to 1)
 * @returns a new Date representing the next occurrence
 */
export function calculateNextDonationDate(
  currentDate: Date,
  recurrence: RecurrenceEnum,
  recurrenceFreq: number | null = 1,
): Date {
  const freq = recurrenceFreq ?? 1;
  const nextDate = new Date(currentDate);
  switch (recurrence) {
    case RecurrenceEnum.WEEKLY:
      nextDate.setDate(nextDate.getDate() + 7 * freq);
      break;
    case RecurrenceEnum.MONTHLY:
      if (nextDate.getDate() > 28) nextDate.setDate(28);
      nextDate.setMonth(nextDate.getMonth() + freq);
      break;
    case RecurrenceEnum.YEARLY:
      if (nextDate.getDate() > 28) nextDate.setDate(28);
      nextDate.setFullYear(nextDate.getFullYear() + freq);
      break;
  }
  return nextDate;
}
