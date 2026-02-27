export enum DonationStatus {
  AVAILABLE = 'available',
  FULFILLED = 'fulfilled',
  MATCHED = 'matched',
}

export enum RecurrenceEnum {
  NONE = 'none',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

export type DayOfWeek =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday';

export type RepeatOnState = Record<DayOfWeek, boolean>;
