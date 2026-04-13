import { calculateNextDonationDate } from './recurrence.utils';
import { RecurrenceEnum } from './types';

describe('calculateNextDonationDate', () => {
  describe('WEEKLY', () => {
    it('advances by 7 days when freq is 1', () => {
      const result = calculateNextDonationDate(
        new Date(2025, 0, 1),
        RecurrenceEnum.WEEKLY,
        1,
      );
      expect(result).toEqual(new Date(2025, 0, 8));
    });

    it('advances by 14 days when freq is 2', () => {
      const result = calculateNextDonationDate(
        new Date(2025, 0, 1),
        RecurrenceEnum.WEEKLY,
        2,
      );
      expect(result).toEqual(new Date(2025, 0, 15));
    });

    it('advances by 21 days when freq is 3', () => {
      const result = calculateNextDonationDate(
        new Date(2025, 2, 10),
        RecurrenceEnum.WEEKLY,
        3,
      );
      expect(result).toEqual(new Date(2025, 2, 31));
    });
  });

  describe('MONTHLY', () => {
    it('advances by 1 month when freq is 1', () => {
      const result = calculateNextDonationDate(
        new Date(2025, 0, 15),
        RecurrenceEnum.MONTHLY,
        1,
      );
      expect(result).toEqual(new Date(2025, 1, 15));
    });

    it('advances by 3 months when freq is 3', () => {
      const result = calculateNextDonationDate(
        new Date(2025, 0, 15),
        RecurrenceEnum.MONTHLY,
        3,
      );
      expect(result).toEqual(new Date(2025, 3, 15));
    });

    it('crosses year boundary correctly', () => {
      const result = calculateNextDonationDate(
        new Date(2025, 10, 15),
        RecurrenceEnum.MONTHLY,
        3,
      );
      expect(result).toEqual(new Date(2026, 1, 15));
    });

    it('clamps day to 28 before adding months when date is after the 28th', () => {
      const result = calculateNextDonationDate(
        new Date(2025, 0, 31),
        RecurrenceEnum.MONTHLY,
        1,
      );
      expect(result).toEqual(new Date(2025, 1, 28));
    });

    it('does not clamp day when date is on the 28th', () => {
      const result = calculateNextDonationDate(
        new Date(2025, 0, 28),
        RecurrenceEnum.MONTHLY,
        1,
      );
      expect(result).toEqual(new Date(2025, 1, 28));
    });
  });

  describe('YEARLY', () => {
    it('advances by 1 year when freq is 1', () => {
      const result = calculateNextDonationDate(
        new Date(2025, 5, 15),
        RecurrenceEnum.YEARLY,
        1,
      );
      expect(result).toEqual(new Date(2026, 5, 15));
    });

    it('advances by 3 years when freq is 3', () => {
      const result = calculateNextDonationDate(
        new Date(2025, 5, 15),
        RecurrenceEnum.YEARLY,
        3,
      );
      expect(result).toEqual(new Date(2028, 5, 15));
    });

    it('clamps day to 28 before adding years when date is after the 28th', () => {
      // Feb 29 doesn't exist in 2025, but JS parses it as Mar 1 — clamping still applies
      const r = calculateNextDonationDate(
        new Date(2024, 1, 29),
        RecurrenceEnum.YEARLY,
        1,
      );
      expect(r).toEqual(new Date(2025, 1, 28));
    });
  });

  describe('null / default recurrenceFreq', () => {
    it('defaults freq to 1 when null is passed for WEEKLY', () => {
      const result = calculateNextDonationDate(
        new Date(2025, 0, 1),
        RecurrenceEnum.WEEKLY,
        null,
      );
      expect(result).toEqual(new Date(2025, 0, 8));
    });

    it('defaults freq to 1 when null is passed for MONTHLY', () => {
      const result = calculateNextDonationDate(
        new Date(2025, 0, 15),
        RecurrenceEnum.MONTHLY,
        null,
      );
      expect(result).toEqual(new Date(2025, 1, 15));
    });

    it('defaults freq to 1 when null is passed for YEARLY', () => {
      const result = calculateNextDonationDate(
        new Date(2025, 5, 15),
        RecurrenceEnum.YEARLY,
        null,
      );
      expect(result).toEqual(new Date(2026, 5, 15));
    });
  });

  describe('NONE', () => {
    it('returns the same date unchanged', () => {
      const input = new Date(2025, 0, 15);
      const result = calculateNextDonationDate(input, RecurrenceEnum.NONE, 1);
      expect(result).toEqual(input);
    });
  });

  it('does not mutate the input date', () => {
    const input = new Date(2025, 0, 1);
    const original = input.getTime();
    calculateNextDonationDate(input, RecurrenceEnum.WEEKLY, 1);
    expect(input.getTime()).toBe(original);
  });
});
