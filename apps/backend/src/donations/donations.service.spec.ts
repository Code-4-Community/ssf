import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Donation } from './donations.entity';
import { DonationService } from './donations.service';
import { FoodManufacturer } from '../foodManufacturers/manufacturers.entity';
import { RecurrenceEnum, DayOfWeek } from './types';
import { RepeatOnDaysDto } from './dtos/create-donation.dto';
import { testDataSource } from '../config/typeormTestDataSource';

jest.setTimeout(60000);

const TODAY = new Date();
TODAY.setHours(0, 0, 0, 0);
const MOCK_MONDAY = new Date(2025, 0, 6);

const daysAgo = (numDays: number) => {
  const date = new Date(TODAY);
  date.setDate(date.getDate() - numDays);
  date.setHours(0, 0, 0, 0);
  return date;
};

const daysFromNow = (numDays: number) => {
  const date = new Date(TODAY);
  date.setDate(date.getDate() + numDays);
  date.setHours(0, 0, 0, 0);
  return date;
};

// insert a minimal donation and return its generated ID
async function insertDonation(overrides: {
  recurrence: RecurrenceEnum;
  recurrenceFreq: number;
  nextDonationDates: Date[];
  occurrencesRemaining: number;
}): Promise<number> {
  // uses FoodCorp Industries manufacturer from test seed data
  const result = await testDataSource.query(
    `INSERT INTO donations
      (food_manufacturer_id, status, recurrence, recurrence_freq, 
      next_donation_dates, occurrences_remaining)
    VALUES
      (
        (SELECT food_manufacturer_id FROM food_manufacturers
        WHERE food_manufacturer_name = 'FoodCorp Industries' LIMIT 1),
        'available',
        $1, $2, $3, $4
      )
      RETURNING donation_id`,
    [
      overrides.recurrence,
      overrides.recurrenceFreq,
      overrides.nextDonationDates,
      overrides.occurrencesRemaining,
    ],
  );
  return result[0].donation_id;
}

const allFalse: RepeatOnDaysDto = {
  Sunday: false,
  Monday: false,
  Tuesday: false,
  Wednesday: false,
  Thursday: false,
  Friday: false,
  Saturday: false,
};

const TODAYOfWeek = (iso: string): DayOfWeek => {
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
    if (!testDataSource.isInitialized) {
      await testDataSource.initialize();
    }

    await testDataSource.query(`DROP SCHEMA IF EXISTS public CASCADE`);
    await testDataSource.query(`CREATE SCHEMA public`);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DonationService,
        {
          provide: getRepositoryToken(Donation),
          useValue: testDataSource.getRepository(Donation),
        },
        {
          provide: getRepositoryToken(FoodManufacturer),
          useValue: testDataSource.getRepository(FoodManufacturer),
        },
      ],
    }).compile();

    service = module.get<DonationService>(DonationService);
  });

  afterEach(async () => {
    await testDataSource.query(`DROP SCHEMA public CASCADE`);
    await testDataSource.query(`CREATE SCHEMA public`);
  });

  beforeEach(async () => {
    await testDataSource.query(`DROP SCHEMA IF EXISTS public CASCADE`);
    await testDataSource.query(`CREATE SCHEMA public`);
    await testDataSource.runMigrations();
  });

  afterAll(async () => {
    if (testDataSource.isInitialized) {
      await testDataSource.destroy();
    }
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getDonationCount', () => {
    it('returns total number of donations in the database', async () => {
      const donationCount = await service.getNumberOfDonations();
      expect(donationCount).toEqual(4);
    });
  });

  describe('handleRecurringDonations', () => {
    describe('no-op cases', () => {
      it('skips donation with no nextDonationDates', async () => {
        const donationId = await insertDonation({
          recurrence: RecurrenceEnum.WEEKLY,
          recurrenceFreq: 1,
          nextDonationDates: [],
          occurrencesRemaining: 3,
        });

        await service.handleRecurringDonations();

        const donation = await service.findOne(donationId);
        expect(donation.nextDonationDates).toEqual([]);
        expect(donation.occurrencesRemaining).toEqual(3);
      });

      it('skips donation whose nextDonationDates are all in the future', async () => {
        const donationId = await insertDonation({
          recurrence: RecurrenceEnum.WEEKLY,
          recurrenceFreq: 1,
          nextDonationDates: [daysFromNow(7)],
          occurrencesRemaining: 3,
        });

        await service.handleRecurringDonations();

        const donation = await service.findOne(donationId);
        expect(donation.nextDonationDates.length).toEqual(1);
        expect(donation.occurrencesRemaining).toEqual(3);
      });
    });

    describe('single expired date', () => {
      it('removes expired date and adds next weekly occurrence', async () => {
        const pastDate = daysAgo(5);
        const donationId = await insertDonation({
          recurrence: RecurrenceEnum.WEEKLY,
          recurrenceFreq: 1,
          nextDonationDates: [pastDate],
          occurrencesRemaining: 3,
        });

        await service.handleRecurringDonations();

        const expectedNextDate = new Date(pastDate);
        expectedNextDate.setDate(expectedNextDate.getDate() + 7);

        const donation = await service.findOne(donationId);
        expect(donation.nextDonationDates).toHaveLength(1);
        expect(donation.nextDonationDates[0].toDateString()).toEqual(
          expectedNextDate.toDateString(),
        );
        expect(donation.occurrencesRemaining).toEqual(2);
      });

      it('removes expired date and adds next monthly occurrence', async () => {
        const pastDate = daysAgo(30);
        const donationId = await insertDonation({
          recurrence: RecurrenceEnum.MONTHLY,
          recurrenceFreq: 1,
          nextDonationDates: [pastDate],
          occurrencesRemaining: 3,
        });

        await service.handleRecurringDonations();

        const expectedNextDate = new Date(pastDate);
        expectedNextDate.setMonth(expectedNextDate.getMonth() + 1);

        const donation = await service.findOne(donationId);
        expect(donation.nextDonationDates).toHaveLength(1);
        expect(donation.nextDonationDates[0].toDateString()).toEqual(
          expectedNextDate.toDateString(),
        );
        expect(donation.occurrencesRemaining).toEqual(2);
      });

      it('removes expired date and adds next yearly occurrence', async () => {
        const pastDate = daysAgo(7);
        const donationId = await insertDonation({
          recurrence: RecurrenceEnum.YEARLY,
          recurrenceFreq: 1,
          nextDonationDates: [pastDate],
          occurrencesRemaining: 3,
        });

        await service.handleRecurringDonations();

        const expectedNextDate = new Date(pastDate);
        expectedNextDate.setFullYear(expectedNextDate.getFullYear() + 1);

        const donation = await service.findOne(donationId);
        expect(donation.nextDonationDates).toHaveLength(1);
        expect(donation.nextDonationDates[0].toDateString()).toEqual(
          expectedNextDate.toDateString(),
        );
        expect(donation.occurrencesRemaining).toEqual(2);
      });
    });

    describe('expired and future dates coexisting', () => {
      it('processes expired date and preserves the existing future date', async () => {
        const pastDate = daysAgo(1);
        const futureDate = daysFromNow(1);

        const donationId = await insertDonation({
          recurrence: RecurrenceEnum.WEEKLY,
          recurrenceFreq: 1,
          nextDonationDates: [pastDate, futureDate],
          occurrencesRemaining: 3,
        });

        await service.handleRecurringDonations();

        const donation = await service.findOne(donationId);

        const replacementDate = new Date(pastDate);
        replacementDate.setDate(replacementDate.getDate() + 7);

        expect(donation.nextDonationDates).toHaveLength(2);

        const times = donation.nextDonationDates.map((d) =>
          new Date(d).getTime(),
        );
        expect(times).toContain(futureDate.getTime());
        expect(times).toContain(replacementDate.getTime());

        expect(donation.occurrencesRemaining).toEqual(2);
      });

      it('processes only past dates and leaves future dates intact', async () => {
        const pastDate = daysAgo(7);
        const futureDate = daysFromNow(7);
        const donationId = await insertDonation({
          recurrence: RecurrenceEnum.WEEKLY,
          recurrenceFreq: 1,
          nextDonationDates: [pastDate, futureDate],
          occurrencesRemaining: 3,
        });

        await service.handleRecurringDonations();

        const donation = await service.findOne(donationId);
        expect(donation.nextDonationDates).toHaveLength(1);

        const times = donation.nextDonationDates.map((d) =>
          new Date(d).getTime(),
        );
        expect(times).toContain(futureDate.getTime());

        expect(donation.occurrencesRemaining).toEqual(1);
      });
    });

    describe('occurrence exhaustion', () => {
      it(`removes expired date without adding replacement when it was the last occurrence`, async () => {
        const pastDate = daysAgo(7);
        const donationId = await insertDonation({
          recurrence: RecurrenceEnum.WEEKLY,
          recurrenceFreq: 1,
          nextDonationDates: [pastDate],
          occurrencesRemaining: 1,
        });

        await service.handleRecurringDonations();

        const donation = await service.findOne(donationId);
        expect(donation.nextDonationDates).toHaveLength(0);
        expect(donation.occurrencesRemaining).toEqual(0);
      });

      it(`doesn't add replacement for non-recurring donation`, async () => {
        const donationId = await insertDonation({
          recurrence: RecurrenceEnum.NONE,
          recurrenceFreq: null,
          nextDonationDates: null,
          occurrencesRemaining: null,
        });
        await service.handleRecurringDonations();

        const donation = await service.findOne(donationId);
        expect(donation.nextDonationDates).toBeNull();
        expect(donation.occurrencesRemaining).toBeNull();
      });

      it('clears nextDonationDates when occurrencesRemaining is already 0', async () => {
        const pastDate = daysAgo(7);
        const donationId = await insertDonation({
          recurrence: RecurrenceEnum.WEEKLY,
          recurrenceFreq: 1,
          nextDonationDates: [pastDate],
          occurrencesRemaining: 0,
        });

        await service.handleRecurringDonations();

        const donation = await service.findOne(donationId);
        expect(donation.nextDonationDates).toHaveLength(0);
        expect(donation.occurrencesRemaining).toEqual(0);
      });
    });

    describe('cascading recalculation', () => {
      it('advances through multiple expired replacement dates until a future date is reached', async () => {
        const pastDate1 = daysAgo(10);
        const pastDate2 = daysAgo(3);
        const donationId = await insertDonation({
          recurrence: RecurrenceEnum.WEEKLY,
          recurrenceFreq: 1,
          nextDonationDates: [pastDate1, pastDate2],
          occurrencesRemaining: 4,
        });

        await service.handleRecurringDonations();

        const donation = await service.findOne(donationId);
        expect(donation.nextDonationDates).toHaveLength(1);
        expect(donation.occurrencesRemaining).toEqual(1);
        expect(
          new Date(donation.nextDonationDates[0]).getTime(),
        ).toBeGreaterThan(new Date().getTime());
      });

      it('stops advancing and schedules no replacement when occurrences run out mid-cascade', async () => {
        const pastDate1 = daysAgo(14);
        const pastDate2 = daysAgo(7);
        const donationId = await insertDonation({
          recurrence: RecurrenceEnum.WEEKLY,
          recurrenceFreq: 1,
          nextDonationDates: [pastDate1, pastDate2],
          occurrencesRemaining: 1,
        });

        await service.handleRecurringDonations();

        const donation = await service.findOne(donationId);
        expect(donation.nextDonationDates).toHaveLength(0);
        expect(donation.occurrencesRemaining).toEqual(0);
      });
    });

    describe('multiple donations', () => {
      it('processes each donation independently based on their recurrence rules', async () => {
        const pastDate1 = daysAgo(14);
        const pastDate2 = daysAgo(7);
        const futureDate = daysFromNow(7);

        const donationId1 = await insertDonation({
          recurrence: RecurrenceEnum.WEEKLY,
          recurrenceFreq: 3,
          nextDonationDates: [pastDate1],
          occurrencesRemaining: 2,
        });

        const donationId2 = await insertDonation({
          recurrence: RecurrenceEnum.MONTHLY,
          recurrenceFreq: 1,
          nextDonationDates: [pastDate2],
          occurrencesRemaining: 1,
        });

        const donationId3 = await insertDonation({
          recurrence: RecurrenceEnum.YEARLY,
          recurrenceFreq: 1,
          nextDonationDates: [futureDate],
          occurrencesRemaining: 3,
        });

        await service.handleRecurringDonations();

        const donation1 = await service.findOne(donationId1);
        const donation2 = await service.findOne(donationId2);
        const donation3 = await service.findOne(donationId3);

        expect(donation1.nextDonationDates).toHaveLength(1);
        expect(
          new Date(donation1.nextDonationDates[0]).getTime(),
        ).toBeGreaterThan(new Date().getTime());
        expect(donation1.occurrencesRemaining).toEqual(1);

        expect(donation2.nextDonationDates).toHaveLength(0);
        expect(donation2.occurrencesRemaining).toEqual(0);

        expect(donation3.nextDonationDates).toHaveLength(1);
        expect(new Date(donation3.nextDonationDates[0]).toDateString()).toEqual(
          futureDate.toDateString(),
        );
        expect(donation3.occurrencesRemaining).toEqual(3);
      });
    });
  });

  describe('generateNextDonationDates', () => {
    it('WEEKLY - returns empty array when no days are selected', async () => {
      const result = await service.generateNextDonationDates(
        MOCK_MONDAY,
        1,
        RecurrenceEnum.WEEKLY,
        allFalse,
      );
      expect(result).toHaveLength(0);
    });

    it('WEEKLY - returns one date when exactly one day is selected (freq = 1)', async () => {
      const repeatOnDays: RepeatOnDaysDto = { ...allFalse, Wednesday: true };
      const result = await service.generateNextDonationDates(
        MOCK_MONDAY,
        1,
        RecurrenceEnum.WEEKLY,
        repeatOnDays,
      );

      expect(result).toHaveLength(1);
      expect(TODAYOfWeek(result[0])).toBe('Wednesday');
    });

    it('WEEKLY - returns dates only for selected days within the target week window', async () => {
      const repeatOnDays: RepeatOnDaysDto = {
        ...allFalse,
        Wednesday: true,
        Friday: true,
      };
      const result = await service.generateNextDonationDates(
        MOCK_MONDAY,
        1,
        RecurrenceEnum.WEEKLY,
        repeatOnDays,
      );

      expect(result).toHaveLength(2);
      const resultDays = result.map(TODAYOfWeek);
      expect(resultDays).toContain('Wednesday');
      expect(resultDays).toContain('Friday');
    });

    it('WEEKLY - offsets dates correctly when freq = 2', async () => {
      // From date is Monday 2025-01-06, day 14 = Monday 2025-01-20, +2 for Wed = Jan 22.
      const repeatOnDays: RepeatOnDaysDto = { ...allFalse, Wednesday: true };
      const result = await service.generateNextDonationDates(
        MOCK_MONDAY,
        2,
        RecurrenceEnum.WEEKLY,
        repeatOnDays,
      );

      expect(result).toHaveLength(1);
      expect(TODAYOfWeek(result[0])).toBe('Wednesday');

      const resultDate = new Date(result[0]);
      expect(resultDate.getDate()).toBe(22);
      expect(resultDate.getMonth()).toBe(0);
    });

    it('WEEKLY - returns dates in ascending order', async () => {
      const repeatOnDays: RepeatOnDaysDto = {
        ...allFalse,
        Tuesday: true,
        Thursday: true,
        Saturday: true,
      };
      const result = await service.generateNextDonationDates(
        MOCK_MONDAY,
        1,
        RecurrenceEnum.WEEKLY,
        repeatOnDays,
      );

      const timestamps = result.map((d) => new Date(d).getTime());
      expect(timestamps).toEqual([...timestamps].sort((a, b) => a - b));
    });

    it("WEEKLY - does not include TODAY's DOW if selected", async () => {
      const repeatOnDays: RepeatOnDaysDto = { ...allFalse, Monday: true };
      const result = await service.generateNextDonationDates(
        MOCK_MONDAY,
        1,
        RecurrenceEnum.WEEKLY,
        repeatOnDays,
      );

      expect(result.every((d) => new Date(d) > MOCK_MONDAY)).toBe(true);
    });

    it('MONTHLY - returns exactly one date', async () => {
      const result = await service.generateNextDonationDates(
        MOCK_MONDAY,
        1,
        RecurrenceEnum.MONTHLY,
        null,
      );
      expect(result).toHaveLength(1);
    });

    it('MONTHLY - adds correct number of months for freq = 1', async () => {
      const result = await service.generateNextDonationDates(
        MOCK_MONDAY,
        1,
        RecurrenceEnum.MONTHLY,
        null,
      );
      const resultDate = new Date(result[0]);

      // 2025-01-06 + 1 month = 2025-02-06
      expect(resultDate.getFullYear()).toBe(2025);
      expect(resultDate.getMonth()).toBe(1); // February
      expect(resultDate.getDate()).toBe(6);
    });

    it('MONTHLY - adds correct number of months for freq = 3', async () => {
      const result = await service.generateNextDonationDates(
        MOCK_MONDAY,
        3,
        RecurrenceEnum.MONTHLY,
        null,
      );
      const resultDate = new Date(result[0]);

      // 2025-01-06 + 3 months = 2025-04-06
      expect(resultDate.getMonth()).toBe(3); // April
      expect(resultDate.getDate()).toBe(6);
    });

    it('MONTHLY - rolls over the year correctly', async () => {
      const result = await service.generateNextDonationDates(
        MOCK_MONDAY,
        12,
        RecurrenceEnum.MONTHLY,
        null,
      );
      const resultDate = new Date(result[0]);

      // 2025-01-06 + 12 months = 2026-01-06
      expect(resultDate.getFullYear()).toBe(2026);
      expect(resultDate.getMonth()).toBe(0); // January
    });

    it('MONTHLY - ignores repeatOnDays', async () => {
      const repeatOnDays: RepeatOnDaysDto = {
        ...allFalse,
        Monday: true,
        Friday: true,
      };
      const withDays = await service.generateNextDonationDates(
        MOCK_MONDAY,
        1,
        RecurrenceEnum.MONTHLY,
        repeatOnDays,
      );
      const withoutDays = await service.generateNextDonationDates(
        MOCK_MONDAY,
        1,
        RecurrenceEnum.MONTHLY,
        null,
      );

      expect(withDays).toEqual(withoutDays);
    });

    it('MONTHLY - clamps to 28th when TODAY is the 29th', async () => {
      const result = await service.generateNextDonationDates(
        new Date(2025, 0, 29),
        1,
        RecurrenceEnum.MONTHLY,
        null,
      );

      expect(new Date(result[0]).getDate()).toBe(28);
      expect(new Date(result[0]).getMonth()).toBe(1); // February
    });

    it('YEARLY - returns exactly one date', async () => {
      const result = await service.generateNextDonationDates(
        MOCK_MONDAY,
        1,
        RecurrenceEnum.YEARLY,
        null,
      );
      expect(result).toHaveLength(1);
    });

    it('YEARLY - adds correct number of years for freq = 1', async () => {
      const result = await service.generateNextDonationDates(
        MOCK_MONDAY,
        1,
        RecurrenceEnum.YEARLY,
        null,
      );
      const resultDate = new Date(result[0]);

      // 2025-01-06 + 1 year = 2026-01-06
      expect(resultDate.getFullYear()).toBe(2026);
      expect(resultDate.getMonth()).toBe(0); // January
      expect(resultDate.getDate()).toBe(6);
    });

    it('YEARLY - adds correct number of years for freq = 5', async () => {
      const result = await service.generateNextDonationDates(
        MOCK_MONDAY,
        5,
        RecurrenceEnum.YEARLY,
        null,
      );

      expect(new Date(result[0]).getFullYear()).toBe(2030);
    });

    it('YEARLY - ignores repeatOnDays', async () => {
      const repeatOnDays: RepeatOnDaysDto = { ...allFalse, Wednesday: true };
      const withDays = await service.generateNextDonationDates(
        MOCK_MONDAY,
        1,
        RecurrenceEnum.YEARLY,
        repeatOnDays,
      );
      const withoutDays = await service.generateNextDonationDates(
        MOCK_MONDAY,
        1,
        RecurrenceEnum.YEARLY,
        null,
      );

      expect(withDays).toEqual(withoutDays);
    });

    it('YEARLY - clamps to 28th when TODAY is the 29th', async () => {
      const result = await service.generateNextDonationDates(
        new Date('2025-01-29T12:00:00.000Z'),
        1,
        RecurrenceEnum.YEARLY,
        null,
      );

      expect(new Date(result[0]).getFullYear()).toBe(2026);
      expect(new Date(result[0]).getDate()).toBe(28);
      expect(new Date(result[0]).getMonth()).toBe(0); // January
    });

    it('NONE - returns empty array', async () => {
      const result = await service.generateNextDonationDates(
        MOCK_MONDAY,
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
        MOCK_MONDAY,
        1,
        RecurrenceEnum.NONE,
        repeatOnDays,
      );
      expect(result).toHaveLength(0);
    });
  });
});
