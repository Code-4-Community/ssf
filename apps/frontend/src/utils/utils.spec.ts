import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { vi } from 'vitest';
import { generateNextDonationDates } from './utils';
import {
  DayOfWeek,
  RepeatEnum,
  RepeatOnState,
} from '../components/forms/newDonationFormModal';

const allFalse: RepeatOnState = {
  Sunday: false,
  Monday: false,
  Tuesday: false,
  Wednesday: false,
  Thursday: false,
  Friday: false,
  Saturday: false,
};

// Pin "today" to a known day so tests are deterministic.
// 2025-01-06 is a Monday.
const MOCK_MONDAY = new Date('2025-01-06T12:00:00.000Z');

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(MOCK_MONDAY);
});

afterEach(() => {
  vi.useRealTimers();
});

const toDayOfWeek = (iso: string): DayOfWeek => {
  const days: DayOfWeek[] = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  return days[new Date(iso).getDay()];
};

// ─── WEEK ─────────────────────────────────────────────────────────────────────

describe('RepeatEnum.WEEK', () => {
  it('returns an empty array when no days are selected', () => {
    const result = generateNextDonationDates('1', RepeatEnum.WEEK, allFalse);
    expect(result).toHaveLength(0);
  });

  it('returns one date when exactly one day is selected (repeatEvery = 1)', () => {
    // Today is Monday. Next Wednesday is in 2 days.
    const repeatOn: RepeatOnState = { ...allFalse, Wednesday: true };
    const result = generateNextDonationDates('1', RepeatEnum.WEEK, repeatOn);

    expect(result).toHaveLength(1);
    expect(toDayOfWeek(result[0])).toBe('Wednesday');
  });

  it('returns dates only for the selected days within the target week window', () => {
    // Today is Monday. repeatEvery = 1 → window is days 1–7 from today.
    const repeatOn: RepeatOnState = {
      ...allFalse,
      Wednesday: true,
      Friday: true,
    };
    const result = generateNextDonationDates('1', RepeatEnum.WEEK, repeatOn);

    expect(result).toHaveLength(2);
    const resultDays = result.map(toDayOfWeek);
    expect(resultDays).toContain('Wednesday');
    expect(resultDays).toContain('Friday');
  });

  it('offsets dates correctly when repeatEvery = 2', () => {
    // repeatEvery = 2 → window starts at day 14 (2 * 7).
    // Today is Monday 2025-01-06, so day 14 = Monday 2025-01-20.
    const repeatOn: RepeatOnState = { ...allFalse, Wednesday: true };
    const result = generateNextDonationDates('2', RepeatEnum.WEEK, repeatOn);

    expect(result).toHaveLength(1);
    expect(toDayOfWeek(result[0])).toBe('Wednesday');

    const resultDate = new Date(result[0]);
    // Day 14 = Jan 20 (Mon), +2 for Wed = Jan 22
    expect(resultDate.getUTCDate()).toBe(22);
    expect(resultDate.getUTCMonth()).toBe(0);
  });

  it('preserves the time component from "now"', () => {
    const repeatOn: RepeatOnState = { ...allFalse, Wednesday: true };
    const result = generateNextDonationDates('1', RepeatEnum.WEEK, repeatOn);

    const resultDate = new Date(result[0]);
    expect(resultDate.getUTCHours()).toBe(MOCK_MONDAY.getUTCHours());
    expect(resultDate.getUTCMinutes()).toBe(MOCK_MONDAY.getUTCMinutes());
    expect(resultDate.getUTCSeconds()).toBe(MOCK_MONDAY.getUTCSeconds());
  });

  it('returns dates in ascending order', () => {
    const repeatOn: RepeatOnState = {
      ...allFalse,
      Tuesday: true,
      Thursday: true,
      Saturday: true,
    };
    const result = generateNextDonationDates('1', RepeatEnum.WEEK, repeatOn);

    const timestamps = result.map((d) => new Date(d).getTime());
    expect(timestamps).toEqual([...timestamps].sort((a, b) => a - b));
  });
});

// ─── MONTH ────────────────────────────────────────────────────────────────────

describe('RepeatEnum.MONTH', () => {
  it('returns exactly one date', () => {
    const result = generateNextDonationDates('1', RepeatEnum.MONTH, allFalse);
    expect(result).toHaveLength(1);
  });

  it('adds the correct number of months for repeatEvery = 1', () => {
    const result = generateNextDonationDates('1', RepeatEnum.MONTH, allFalse);
    const resultDate = new Date(result[0]);

    // 2025-01-06 + 1 month = 2025-02-06
    expect(resultDate.getUTCMonth()).toBe(1); // February
    expect(resultDate.getUTCDate()).toBe(6);
    expect(resultDate.getUTCFullYear()).toBe(2025);
  });

  it('adds the correct number of months for repeatEvery = 3', () => {
    const result = generateNextDonationDates('3', RepeatEnum.MONTH, allFalse);
    const resultDate = new Date(result[0]);

    // 2025-01-06 + 3 months = 2025-04-06
    expect(resultDate.getUTCMonth()).toBe(3); // April
    expect(resultDate.getUTCDate()).toBe(6);
  });

  it('rolls over the year correctly', () => {
    const result = generateNextDonationDates('12', RepeatEnum.MONTH, allFalse);
    const resultDate = new Date(result[0]);

    // 2025-01-06 + 12 months = 2026-01-06
    expect(resultDate.getUTCFullYear()).toBe(2026);
    expect(resultDate.getUTCMonth()).toBe(0);
  });

  it('preserves the time component from "now"', () => {
    const result = generateNextDonationDates('1', RepeatEnum.MONTH, allFalse);
    const resultDate = new Date(result[0]);

    expect(resultDate.getUTCHours()).toBe(MOCK_MONDAY.getUTCHours());
    expect(resultDate.getUTCMinutes()).toBe(MOCK_MONDAY.getUTCMinutes());
  });

  it('ignores the repeatOn state', () => {
    const repeatOn: RepeatOnState = { ...allFalse, Monday: true, Friday: true };
    const withDays = generateNextDonationDates('1', RepeatEnum.MONTH, repeatOn);
    const withoutDays = generateNextDonationDates(
      '1',
      RepeatEnum.MONTH,
      allFalse,
    );

    expect(withDays).toEqual(withoutDays);
  });
});

// ─── YEAR ─────────────────────────────────────────────────────────────────────

describe('RepeatEnum.YEAR', () => {
  it('returns exactly one date', () => {
    const result = generateNextDonationDates('1', RepeatEnum.YEAR, allFalse);
    expect(result).toHaveLength(1);
  });

  it('adds the correct number of years for repeatEvery = 1', () => {
    const result = generateNextDonationDates('1', RepeatEnum.YEAR, allFalse);
    const resultDate = new Date(result[0]);

    // 2025-01-06 + 1 year = 2026-01-06
    expect(resultDate.getUTCFullYear()).toBe(2026);
    expect(resultDate.getUTCMonth()).toBe(0);
    expect(resultDate.getUTCDate()).toBe(6);
  });

  it('adds the correct number of years for repeatEvery = 5', () => {
    const result = generateNextDonationDates('5', RepeatEnum.YEAR, allFalse);
    const resultDate = new Date(result[0]);

    expect(resultDate.getUTCFullYear()).toBe(2030);
  });

  it('preserves the time component from "now"', () => {
    const result = generateNextDonationDates('1', RepeatEnum.YEAR, allFalse);
    const resultDate = new Date(result[0]);

    expect(resultDate.getUTCHours()).toBe(MOCK_MONDAY.getUTCHours());
    expect(resultDate.getUTCMinutes()).toBe(MOCK_MONDAY.getUTCMinutes());
  });

  it('ignores the repeatOn state', () => {
    const repeatOn: RepeatOnState = { ...allFalse, Wednesday: true };
    const withDays = generateNextDonationDates('1', RepeatEnum.YEAR, repeatOn);
    const withoutDays = generateNextDonationDates(
      '1',
      RepeatEnum.YEAR,
      allFalse,
    );

    expect(withDays).toEqual(withoutDays);
  });
});

// ─── NONE ─────────────────────────────────────────────────────────────────────

describe('RepeatEnum.NONE', () => {
  it('returns an empty array', () => {
    const result = generateNextDonationDates('1', RepeatEnum.NONE, allFalse);
    expect(result).toHaveLength(0);
  });

  it('returns an empty array regardless of repeatOn state', () => {
    const repeatOn: RepeatOnState = { ...allFalse, Monday: true, Friday: true };
    const result = generateNextDonationDates('1', RepeatEnum.NONE, repeatOn);
    expect(result).toHaveLength(0);
  });
});
