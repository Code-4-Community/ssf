import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Donation } from './donations.entity';
import { DonationService } from './donations.service';
import { mock } from 'jest-mock-extended';
import { FoodManufacturer } from '../foodManufacturers/manufacturers.entity';
import { RecurrenceEnum, DayOfWeek } from './types';
import { RepeatOnDaysDto } from './dtos/create-donation.dto';

const mockDonationRepository = mock<Repository<Donation>>();
const mockFoodManufacturerRepository = mock<Repository<FoodManufacturer>>();

const allFalse: RepeatOnDaysDto = {
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

describe('DonationService', () => {
  let service: DonationService;

  beforeAll(async () => {
    mockDonationRepository.count.mockReset();

    const module = await Test.createTestingModule({
      providers: [
        DonationService,
        {
          provide: getRepositoryToken(Donation),
          useValue: mockDonationRepository,
        },
        {
          provide: getRepositoryToken(FoodManufacturer),
          useValue: mockFoodManufacturerRepository,
        },
      ],
    }).compile();

    service = module.get<DonationService>(DonationService);
  });

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(MOCK_MONDAY);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getDonationCount', () => {
    it.each([[0], [5]])('should return %i donations', async (count) => {
      mockDonationRepository.count.mockResolvedValue(count);

      const donationCount: number = await service.getNumberOfDonations();

      expect(donationCount).toEqual(count);
      expect(mockDonationRepository.count).toHaveBeenCalled();
    });
  });

  describe('generateNextDonationDates', () => {
    it('WEEKLY - returns empty array when no days are selected', async () => {
      const result = await service.generateNextDonationDates(
        1,
        RecurrenceEnum.WEEKLY,
        allFalse,
      );
      expect(result).toHaveLength(0);
    });

    it('WEEKLY - returns one date when exactly one day is selected (freq = 1)', async () => {
      const repeatOnDays: RepeatOnDaysDto = { ...allFalse, Wednesday: true };
      const result = await service.generateNextDonationDates(
        1,
        RecurrenceEnum.WEEKLY,
        repeatOnDays,
      );

      expect(result).toHaveLength(1);
      expect(toDayOfWeek(result[0])).toBe('Wednesday');
    });

    it('WEEKLY - returns dates only for selected days within the target week window', async () => {
      const repeatOnDays: RepeatOnDaysDto = {
        ...allFalse,
        Wednesday: true,
        Friday: true,
      };
      const result = await service.generateNextDonationDates(
        1,
        RecurrenceEnum.WEEKLY,
        repeatOnDays,
      );

      expect(result).toHaveLength(2);
      const resultDays = result.map(toDayOfWeek);
      expect(resultDays).toContain('Wednesday');
      expect(resultDays).toContain('Friday');
    });

    it('WEEKLY - offsets dates correctly when freq = 2', async () => {
      // Today is Monday 2025-01-06, day 14 = Monday 2025-01-20, +2 for Wed = Jan 22.
      const repeatOnDays: RepeatOnDaysDto = { ...allFalse, Wednesday: true };
      const result = await service.generateNextDonationDates(
        2,
        RecurrenceEnum.WEEKLY,
        repeatOnDays,
      );

      expect(result).toHaveLength(1);
      expect(toDayOfWeek(result[0])).toBe('Wednesday');

      const resultDate = new Date(result[0]);
      expect(resultDate.getUTCDate()).toBe(22);
      expect(resultDate.getUTCMonth()).toBe(0);
    });

    it('WEEKLY - returns dates in ascending order', async () => {
      const repeatOnDays: RepeatOnDaysDto = {
        ...allFalse,
        Tuesday: true,
        Thursday: true,
        Saturday: true,
      };
      const result = await service.generateNextDonationDates(
        1,
        RecurrenceEnum.WEEKLY,
        repeatOnDays,
      );

      const timestamps = result.map((d) => new Date(d).getTime());
      expect(timestamps).toEqual([...timestamps].sort((a, b) => a - b));
    });

    it('WEEKLY - does not include today even if today is selected', async () => {
      const repeatOnDays: RepeatOnDaysDto = { ...allFalse, Monday: true };
      const result = await service.generateNextDonationDates(
        1,
        RecurrenceEnum.WEEKLY,
        repeatOnDays,
      );

      expect(result.every((d) => new Date(d) > MOCK_MONDAY)).toBe(true);
    });

    it('MONTHLY - returns exactly one date', async () => {
      const result = await service.generateNextDonationDates(
        1,
        RecurrenceEnum.MONTHLY,
        null,
      );
      expect(result).toHaveLength(1);
    });

    it('MONTHLY - adds correct number of months for freq = 1', async () => {
      const result = await service.generateNextDonationDates(
        1,
        RecurrenceEnum.MONTHLY,
        null,
      );
      const resultDate = new Date(result[0]);

      // 2025-01-06 + 1 month = 2025-02-06
      expect(resultDate.getUTCFullYear()).toBe(2025);
      expect(resultDate.getUTCMonth()).toBe(1);
      expect(resultDate.getUTCDate()).toBe(6);
    });

    it('MONTHLY - adds correct number of months for freq = 3', async () => {
      const result = await service.generateNextDonationDates(
        3,
        RecurrenceEnum.MONTHLY,
        null,
      );
      const resultDate = new Date(result[0]);

      // 2025-01-06 + 3 months = 2025-04-06
      expect(resultDate.getUTCMonth()).toBe(3);
      expect(resultDate.getUTCDate()).toBe(6);
    });

    it('MONTHLY - rolls over the year correctly', async () => {
      const result = await service.generateNextDonationDates(
        13,
        RecurrenceEnum.MONTHLY,
        null,
      );
      const resultDate = new Date(result[0]);

      // 2025-01-06 + 12 months = 2026-01-06
      expect(resultDate.getUTCFullYear()).toBe(2026);
      expect(resultDate.getUTCMonth()).toBe(1);
    });

    it('MONTHLY - ignores repeatOnDays', async () => {
      const repeatOnDays: RepeatOnDaysDto = {
        ...allFalse,
        Monday: true,
        Friday: true,
      };
      const withDays = await service.generateNextDonationDates(
        1,
        RecurrenceEnum.MONTHLY,
        repeatOnDays,
      );
      const withoutDays = await service.generateNextDonationDates(
        1,
        RecurrenceEnum.MONTHLY,
        null,
      );

      expect(withDays).toEqual(withoutDays);
    });

    it('MONTHLY - clamps to 28th when today is the 29th', async () => {
      jest.setSystemTime(new Date('2025-01-29T12:00:00.000Z'));
      const result = await service.generateNextDonationDates(
        1,
        RecurrenceEnum.MONTHLY,
        null,
      );

      expect(new Date(result[0]).getUTCDate()).toBe(28);
      expect(new Date(result[0]).getUTCMonth()).toBe(1);
    });

    it('YEARLY - returns exactly one date', async () => {
      const result = await service.generateNextDonationDates(
        1,
        RecurrenceEnum.YEARLY,
        null,
      );
      expect(result).toHaveLength(1);
    });

    it('YEARLY - adds correct number of years for freq = 1', async () => {
      const result = await service.generateNextDonationDates(
        1,
        RecurrenceEnum.YEARLY,
        null,
      );
      const resultDate = new Date(result[0]);

      // 2025-01-06 + 1 year = 2026-01-06
      expect(resultDate.getUTCFullYear()).toBe(2026);
      expect(resultDate.getUTCMonth()).toBe(0);
      expect(resultDate.getUTCDate()).toBe(6);
    });

    it('YEARLY - adds correct number of years for freq = 5', async () => {
      const result = await service.generateNextDonationDates(
        5,
        RecurrenceEnum.YEARLY,
        null,
      );

      expect(new Date(result[0]).getUTCFullYear()).toBe(2030);
    });

    it('YEARLY - ignores repeatOnDays', async () => {
      const repeatOnDays: RepeatOnDaysDto = { ...allFalse, Wednesday: true };
      const withDays = await service.generateNextDonationDates(
        1,
        RecurrenceEnum.YEARLY,
        repeatOnDays,
      );
      const withoutDays = await service.generateNextDonationDates(
        1,
        RecurrenceEnum.YEARLY,
        null,
      );

      expect(withDays).toEqual(withoutDays);
    });

    it('YEARLY - clamps to 28th when today is the 29th', async () => {
      jest.setSystemTime(new Date('2025-01-29T12:00:00.000Z'));
      const result = await service.generateNextDonationDates(
        1,
        RecurrenceEnum.YEARLY,
        null,
      );

      expect(new Date(result[0]).getUTCFullYear()).toBe(2026);
      expect(new Date(result[0]).getUTCDate()).toBe(28);
      expect(new Date(result[0]).getUTCMonth()).toBe(0);
    });

    it('NONE - returns empty array', async () => {
      const result = await service.generateNextDonationDates(
        1,
        RecurrenceEnum.NONE,
        null,
      );
      expect(result).toHaveLength(0);
    });

    it('NONE - returns empty array regardless of repeatOnDays', async () => {
      const repeatOnDays: RepeatOnDaysDto = {
        ...allFalse,
        Monday: true,
        Friday: true,
      };
      const result = await service.generateNextDonationDates(
        1,
        RecurrenceEnum.NONE,
        repeatOnDays,
      );
      expect(result).toHaveLength(0);
    });
  });
});
