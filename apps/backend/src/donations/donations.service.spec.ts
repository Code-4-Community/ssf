import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Donation } from './donations.entity';
import { DonationService } from './donations.service';
import { FoodManufacturer } from '../foodManufacturers/manufacturers.entity';
import { RecurrenceEnum, DayOfWeek, DonationStatus } from './types';
import { RepeatOnDaysDto } from './dtos/create-donation.dto';
import { testDataSource } from '../config/typeormTestDataSource';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DonationItem } from '../donationItems/donationItems.entity';
import { ConfirmDonationItemDetailsDto } from '../donationItems/dtos/confirm-donation-item-details.dto';
import { DonationItemsService } from '../donationItems/donationItems.service';
import { Allocation } from '../allocations/allocations.entity';
import { DataSource, In } from 'typeorm';
import {
  ReplaceDonationItemDto,
  ReplaceDonationItemsDto,
} from '../donationItems/dtos/create-donation-items.dto';
import { FoodType } from '../donationItems/types';

jest.setTimeout(60000);

const TODAY = new Date();
TODAY.setHours(0, 0, 0, 0);
const MOCK_MONDAY = new Date(2025, 0, 6);

const daysAgo = (numDays: number): Date => {
  const date = new Date(TODAY);
  date.setDate(date.getDate() - numDays);
  date.setHours(0, 0, 0, 0);
  return date;
};

const daysFromNow = (numDays: number): Date => {
  const date = new Date(TODAY);
  date.setDate(date.getDate() + numDays);
  date.setHours(0, 0, 0, 0);
  return date;
};

async function insertMatchedDonation(): Promise<number> {
  const result = await testDataSource.query(
    `INSERT INTO donations
      (food_manufacturer_id, status, recurrence, recurrence_freq,
       next_donation_dates, occurrences_remaining)
     VALUES (
       (SELECT food_manufacturer_id FROM food_manufacturers
        WHERE food_manufacturer_name = 'FoodCorp Industries' LIMIT 1),
       'matched', 'none', NULL, NULL, NULL
     )
     RETURNING donation_id`,
  );
  return result[0].donation_id;
}

async function insertDonationItem(
  donationId: number,
  qty: number,
  reserved: number,
): Promise<number> {
  const result = await testDataSource.query(
    `INSERT INTO donation_items
      (donation_id, item_name, quantity, reserved_quantity, food_type, details_confirmed)
     VALUES ($1, 'Test Item', $2, $3, 'Granola', false)
     RETURNING item_id`,
    [donationId, qty, reserved],
  );
  return result[0].item_id;
}

async function insertAllocation(
  orderId: number,
  itemId: number,
): Promise<void> {
  await testDataSource.query(
    `INSERT INTO allocations (order_id, item_id, allocated_quantity)
     VALUES ($1, $2, 1)`,
    [orderId, itemId],
  );
}

// insert a minimal donation and return its generated ID
async function insertDonation(overrides: {
  recurrence: RecurrenceEnum;
  recurrenceFreq: number | null;
  nextDonationDates: Date[] | null;
  occurrencesRemaining: number | null;
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
  let donationItemService: DonationItemsService;

  beforeAll(async () => {
    if (!testDataSource.isInitialized) {
      await testDataSource.initialize();
    }

    await testDataSource.query(`DROP SCHEMA IF EXISTS public CASCADE`);
    await testDataSource.query(`CREATE SCHEMA public`);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DonationService,
        DonationItemsService,
        {
          provide: getRepositoryToken(Allocation),
          useValue: testDataSource.getRepository(Allocation),
        },
        {
          provide: getRepositoryToken(Donation),
          useValue: testDataSource.getRepository(Donation),
        },
        {
          provide: getRepositoryToken(FoodManufacturer),
          useValue: testDataSource.getRepository(FoodManufacturer),
        },
        {
          provide: getRepositoryToken(DonationItem),
          useValue: testDataSource.getRepository(DonationItem),
        },
        {
          provide: DataSource,
          useValue: testDataSource,
        },
      ],
    }).compile();

    service = module.get<DonationService>(DonationService);
    donationItemService =
      module.get<DonationItemsService>(DonationItemsService);
  });

  beforeEach(async () => {
    await testDataSource.query(`DROP SCHEMA IF EXISTS public CASCADE`);
    await testDataSource.query(`CREATE SCHEMA public`);
    await testDataSource.runMigrations();
  });

  afterEach(async () => {
    await testDataSource.query(`DROP SCHEMA public CASCADE`);
    await testDataSource.query(`CREATE SCHEMA public`);
  });

  afterAll(async () => {
    if (testDataSource.isInitialized) {
      await testDataSource.destroy();
    }
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should return a donation with the corresponding id', async () => {
      const donationId = 1;
      const result = await service.findOne(donationId);
      expect(result).toBeDefined();
      expect(result.donationId).toBe(donationId);
      expect(result.foodManufacturer.foodManufacturerName).toBe(
        'FoodCorp Industries',
      );
      expect(result.status).toBe(DonationStatus.AVAILABLE);
      expect(result.recurrence).toBe(RecurrenceEnum.NONE);
    });

    it('should throw NotFoundException for non-existent donation', async () => {
      await expect(service.findOne(999)).rejects.toThrow(
        new NotFoundException('Donation 999 not found'),
      );
    });
  });

  describe('getAll', () => {
    it('returns all donations in the database with food manufacturer relation', async () => {
      const donations = await service.getAll();
      expect(donations).toHaveLength(4);

      donations.forEach((d) => {
        expect(d.foodManufacturer).toBeDefined();
      });

      const firstDonation = donations[0];
      expect(firstDonation.status).toBe(DonationStatus.MATCHED);
      expect(firstDonation.foodManufacturer.foodManufacturerId).toBe(2);
      expect(firstDonation.recurrence).toBe(RecurrenceEnum.NONE);
    });
  });

  describe('getNumberOfDonations', () => {
    it('returns total number of donations in the database', async () => {
      const donationCount = await service.getNumberOfDonations();
      expect(donationCount).toEqual(4);
    });
  });

  describe('matchAll', () => {
    it('updates all given donations to have status MATCHED', async () => {
      const donationId1 = 1;
      const donationId2 = 2;
      const donationIds = [donationId1, donationId2];

      const donation1 = await service.findOne(donationId1);
      const donation2 = await service.findOne(donationId2);
      expect(donation1.status).toEqual(DonationStatus.AVAILABLE);
      expect(donation2.status).toEqual(DonationStatus.MATCHED);

      await service.matchAll(donationIds);

      const updatedDonation1 = await service.findOne(donationId1);
      const updatedDonation2 = await service.findOne(donationId2);

      expect(updatedDonation1.status).toEqual(DonationStatus.MATCHED);
      expect(updatedDonation2.status).toEqual(DonationStatus.MATCHED);
    });

    it('throws an error if one or more donationIds do not exist', async () => {
      const existingDonationId = 1;
      const nonExistingDonationId = 999;

      const donationIds = [existingDonationId, nonExistingDonationId];

      await expect(service.matchAll(donationIds)).rejects.toThrow(
        `Donations not found for ID(s): ${nonExistingDonationId}`,
      );
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
        expect(donation.nextDonationDates?.length).toEqual(1);
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
        expect(donation.nextDonationDates?.[0].toDateString()).toEqual(
          expectedNextDate.toDateString(),
        );
        expect(donation.occurrencesRemaining).toEqual(2);
      });

      it('removes expired date and adds next monthly occurrence', async () => {
        const pastDate = daysAgo(15);
        const donationId = await insertDonation({
          recurrence: RecurrenceEnum.MONTHLY,
          recurrenceFreq: 1,
          nextDonationDates: [pastDate],
          occurrencesRemaining: 3,
        });

        await service.handleRecurringDonations();

        const expectedNextDate = new Date(pastDate);
        if (expectedNextDate.getDate() > 28) {
          expectedNextDate.setDate(28);
        }
        expectedNextDate.setMonth(expectedNextDate.getMonth() + 1);

        const donation = await service.findOne(donationId);
        expect(donation.nextDonationDates).toHaveLength(1);
        expect(donation.nextDonationDates?.[0].toDateString()).toEqual(
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
        if (expectedNextDate.getDate() > 28) {
          expectedNextDate.setDate(28);
        }
        expectedNextDate.setFullYear(expectedNextDate.getFullYear() + 1);

        const donation = await service.findOne(donationId);
        expect(donation.nextDonationDates).toHaveLength(1);
        expect(donation.nextDonationDates?.[0].toDateString()).toEqual(
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

        const times = (donation.nextDonationDates ?? []).map((d) =>
          new Date(d).getTime(),
        );
        expect(times).toContain(futureDate.getTime());
        expect(times).toContain(replacementDate.getTime());
        expect(times).toHaveLength(2);

        expect(donation.occurrencesRemaining).toEqual(2);
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
        expect(donation.occurrencesRemaining).toEqual(1);
        expect(donation.nextDonationDates).toHaveLength(1);
        if (donation.nextDonationDates?.[0]) {
          expect(
            new Date(donation.nextDonationDates[0]).getTime(),
          ).toBeGreaterThan(new Date().getTime());
        }
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

        const donationId0Recurrences = await insertDonation({
          recurrence: RecurrenceEnum.WEEKLY,
          recurrenceFreq: 1,
          nextDonationDates: [pastDate1],
          occurrencesRemaining: 0,
        });

        await service.handleRecurringDonations();

        const donation1 = await service.findOne(donationId1);
        const donation2 = await service.findOne(donationId2);
        const donation3 = await service.findOne(donationId3);
        const donation0Recurrences = await service.findOne(
          donationId0Recurrences,
        );

        expect(donation1.nextDonationDates).toHaveLength(1);
        if (donation1.nextDonationDates?.[0]) {
          expect(
            new Date(donation1.nextDonationDates[0]).getTime(),
          ).toBeGreaterThan(new Date().getTime());
        }
        expect(donation1.nextDonationDates?.[0].toDateString()).toEqual(
          daysFromNow(7).toDateString(),
        );
        expect(donation1.occurrencesRemaining).toEqual(1);

        expect(donation2.nextDonationDates).toHaveLength(0);
        expect(donation2.occurrencesRemaining).toEqual(0);

        expect(donation3.nextDonationDates).toHaveLength(1);
        expect(donation3.nextDonationDates?.[0].toDateString()).toEqual(
          futureDate.toDateString(),
        );
        expect(donation3.occurrencesRemaining).toEqual(3);

        expect(donation0Recurrences.nextDonationDates).toHaveLength(0);
        expect(donation0Recurrences.occurrencesRemaining).toEqual(0);
      });
    });

    describe('date calculation', () => {
      it('clips monthly recurrence to 28th when date is 31st', async () => {
        const jan31 = new Date(2026, 0, 31);
        jan31.setHours(0, 0, 0, 0);

        const donationId = await insertDonation({
          recurrence: RecurrenceEnum.MONTHLY,
          recurrenceFreq: 1,
          nextDonationDates: [jan31],
          occurrencesRemaining: 500,
        });

        await service.handleRecurringDonations();

        const donation = await service.findOne(donationId);

        expect(donation.nextDonationDates?.[0].getDate()).toEqual(28);
      });
    });

    describe('edge case: date equals today', () => {
      it('processes donation when nextDonationDate equals today (not in future)', async () => {
        const today = daysAgo(0);
        const donationId = await insertDonation({
          recurrence: RecurrenceEnum.WEEKLY,
          recurrenceFreq: 1,
          nextDonationDates: [today],
          occurrencesRemaining: 3,
        });

        await service.handleRecurringDonations();

        const donation = await service.findOne(donationId);

        expect(donation.nextDonationDates).toHaveLength(1);
        expect(donation.nextDonationDates?.[0].toDateString()).toEqual(
          daysFromNow(7).toDateString(),
        );
        expect(donation.occurrencesRemaining).toEqual(2);
      });

      it('does not process donation when nextDonationDate is exactly 1 day in future', async () => {
        const tomorrow = daysFromNow(1);
        const donationId = await insertDonation({
          recurrence: RecurrenceEnum.WEEKLY,
          recurrenceFreq: 1,
          nextDonationDates: [tomorrow],
          occurrencesRemaining: 3,
        });

        await service.handleRecurringDonations();

        const donation = await service.findOne(donationId);

        expect(donation.nextDonationDates).toHaveLength(1);
        expect(donation.nextDonationDates?.[0].toDateString()).toEqual(
          tomorrow.toDateString(),
        );
        expect(donation.occurrencesRemaining).toEqual(3);
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

  describe('create', () => {
    const validItems = [
      {
        itemName: 'Canned Beans',
        quantity: 10,
        ozPerItem: 15.5,
        estimatedValue: 2.99,
        foodType: FoodType.DAIRY_FREE_ALTERNATIVES,
        foodRescue: false,
      },
      {
        itemName: 'Canned Corn',
        quantity: 5,
        ozPerItem: 12,
        estimatedValue: 1.99,
        foodType: FoodType.GRANOLA,
        foodRescue: true,
      },
    ];

    it('successfully creates a donation with items', async () => {
      const donation = await service.create({
        foodManufacturerId: 1,
        recurrence: RecurrenceEnum.NONE,
        items: validItems,
      });

      expect(donation).toBeDefined();
      expect(donation.donationId).toBeDefined();

      const donationDb = await testDataSource.query(
        `SELECT * FROM donations WHERE donation_id = $1`,
        [donation.donationId],
      );

      expect(donationDb).toHaveLength(1);
      const donationRow = donationDb[0];
      expect(donationRow.donation_id).toEqual(donation.donationId);
      expect(donationRow.food_manufacturer_id).toEqual(1);
      expect(donationRow.status).toEqual(DonationStatus.AVAILABLE);
      expect(donationRow.recurrence).toEqual(RecurrenceEnum.NONE);
      expect(donationRow.recurrence_freq).toBeNull();
      expect(donationRow.next_donation_dates).toBeNull();
      expect(donationRow.occurrences_remaining).toBeNull();

      const items = await testDataSource.query(
        `SELECT * FROM donation_items WHERE donation_id = $1`,
        [donation.donationId],
      );

      expect(items).toHaveLength(2);
    });

    it('populates nextDonationDates in the database for a recurring donation', async () => {
      const before = new Date();
      before.setHours(0, 0, 0, 0);

      const donation = await service.create({
        foodManufacturerId: 1,
        recurrence: RecurrenceEnum.MONTHLY,
        recurrenceFreq: 1,
        occurrencesRemaining: 3,
        items: validItems,
      });

      const rows = await testDataSource.query(
        `SELECT next_donation_dates, occurrences_remaining, recurrence, recurrence_freq
         FROM donations WHERE donation_id = $1`,
        [donation.donationId],
      );

      expect(rows).toHaveLength(1);
      const row = rows[0];

      expect(row.recurrence).toEqual(RecurrenceEnum.MONTHLY);
      expect(row.recurrence_freq).toEqual(1);
      expect(row.occurrences_remaining).toEqual(3);

      const dates: Date[] = row.next_donation_dates;
      expect(dates).toHaveLength(1);

      // Clip the before date if necessary
      const expectedDate = new Date(before);
      if (expectedDate.getDate() > 28) expectedDate.setDate(28);
      expectedDate.setMonth(expectedDate.getMonth() + 1);

      const actualDate = new Date(dates[0]);
      expect(actualDate.getFullYear()).toEqual(expectedDate.getFullYear());
      expect(actualDate.getMonth()).toEqual(expectedDate.getMonth());
      expect(actualDate.getDate()).toEqual(expectedDate.getDate());
    });

    it('throws when foodManufacturerId does not exist', async () => {
      expect(
        service.create({
          foodManufacturerId: 99999,
          recurrence: RecurrenceEnum.NONE,
          items: validItems,
        }),
      ).rejects.toThrow(
        new NotFoundException('Food Manufacturer 99999 not found'),
      );
    });

    it('throws when recurrence is not NONE but recurrenceFreq is missing', async () => {
      let donations = await testDataSource.query(`SELECT * FROM donations`);
      expect(donations).toHaveLength(4);
      await expect(
        service.create({
          foodManufacturerId: 1,
          recurrence: RecurrenceEnum.WEEKLY,
          repeatOnDays: {
            Sunday: false,
            Monday: true,
            Tuesday: false,
            Wednesday: false,
            Thursday: false,
            Friday: false,
            Saturday: false,
          },
          items: validItems,
        }),
      ).rejects.toThrow(
        new BadRequestException(
          'recurrenceFreq is required for recurring donations',
        ),
      );

      donations = await testDataSource.query(`SELECT * FROM donations`);
      expect(donations).toHaveLength(4);
    });

    it('rolls back donation when a donation item fails to save', async () => {
      let donations = await testDataSource.query(`SELECT * FROM donations`);
      expect(donations).toHaveLength(4);

      await expect(
        service.create({
          foodManufacturerId: 1,
          recurrence: RecurrenceEnum.NONE,
          items: [
            ...validItems,
            {
              itemName: 'a'.repeat(1000),
              quantity: 5,
              foodType: FoodType.DAIRY_FREE_ALTERNATIVES,
              foodRescue: false,
            },
          ],
        }),
      ).rejects.toThrow();

      donations = await testDataSource.query(`SELECT * FROM donations`);
      expect(donations).toHaveLength(4);
    });
  });

  describe('replaceDonationItems', () => {
    it('should replace donation items for an available donation', async () => {
      const donationId = 1;

      // (update item1, remove item2, remove item3, add item 4)
      const body = {
        items: [
          {
            id: 1,
            itemName: 'Green Apples',
            quantity: 15,
          } as Partial<ReplaceDonationItemDto>,
          {
            itemName: 'Bananas',
            quantity: 20,
            foodType: FoodType.DAIRY_FREE_ALTERNATIVES,
          } as Partial<ReplaceDonationItemDto>,
        ],
      } as ReplaceDonationItemsDto;

      // manually removing allocations for deleted item ids
      await service['allocationRepo'].delete({ itemId: In([2, 3]) });

      const updatedDonation = await service.replaceDonationItems(
        donationId,
        body,
      );

      expect(updatedDonation).toBeDefined();
      expect(updatedDonation.donationItems).toHaveLength(2);

      const updatedItemNames = updatedDonation.donationItems.map(
        (i) => i.itemName,
      );
      expect(updatedItemNames).toContain('Green Apples'); // updated
      expect(updatedItemNames).toContain('Bananas'); // new
      expect(updatedItemNames).not.toContain('Canned Green Beans'); // deleted
      expect(updatedItemNames).not.toContain('Whole Wheat Bread'); // deleted
    });

    it('should throw BadRequestException if allocation exists for deleted donation item', async () => {
      const donationId = 1;

      // (update item1, remove item2, remove item3, add item 4)
      const body = {
        items: [
          {
            id: 1,
            itemName: 'Green Apples',
            quantity: 15,
          } as Partial<ReplaceDonationItemDto>,
          {
            itemName: 'Bananas',
            quantity: 20,
            foodType: FoodType.DAIRY_FREE_ALTERNATIVES,
          } as Partial<ReplaceDonationItemDto>,
        ],
      } as ReplaceDonationItemsDto;

      await expect(
        service.replaceDonationItems(donationId, body),
      ).rejects.toThrow(
        `Cannot delete donation item(s) with existing allocation(s), replacing donation items failed and not exectued`,
      );
    });

    it('should delete all donation items for an available donation when passed an empty array', async () => {
      const donationId = 1;

      const body = {
        items: [],
      } as ReplaceDonationItemsDto;

      // manually removing allocations for deleted item ids
      await service['allocationRepo'].delete({ itemId: In([1, 2, 3]) });

      const updatedDonation = await service.replaceDonationItems(
        donationId,
        body,
      );

      expect(updatedDonation).toBeDefined();
      expect(updatedDonation.donationItems).toHaveLength(0);
    });

    it('should throw NotFoundException if donation does not exist', async () => {
      const body = { items: [] };
      await expect(service.replaceDonationItems(9999, body)).rejects.toThrow(
        `Donation 9999 not found`,
      );
    });

    it('should throw BadRequestException if donation is not AVAILABLE', async () => {
      // Donation with status MATCHED
      const donationId = 2;

      const body = { items: [] };
      await expect(
        service.replaceDonationItems(donationId, body),
      ).rejects.toThrow('Only available donations can be updated');
    });

    it('should throw NotFoundException if trying to update an item that does not exist within current donation', async () => {
      const donationId = 1;

      const body = {
        items: [
          {
            id: 9999,
            itemName: 'Nonexistent',
            quantity: 1,
          } as Partial<DonationItem>,
        ],
      } as ReplaceDonationItemsDto;

      await expect(
        service.replaceDonationItems(donationId, body),
      ).rejects.toThrow(
        `Donation item 9999 for Donation ${donationId} not found`,
      );
    });
  });

  describe('delete', () => {
    it('should delete an available donation and associated donation items', async () => {
      const donationId = 3;

      const donationBefore = await service.findOne(donationId);
      expect(donationBefore).toBeDefined();
      expect(donationBefore.status).toBe(DonationStatus.AVAILABLE);

      const itemsBefore = await donationItemService.getAllDonationItems(
        donationId,
      );

      const itemIds = itemsBefore.map((item) => item.itemId);

      await testDataSource
        .getRepository(Allocation)
        .delete(itemIds.length ? { itemId: In(itemIds) } : {});

      await service.delete(donationId);

      await expect(service.findOne(donationId)).rejects.toThrow(
        `Donation ${donationId} not found`,
      );

      const items = await donationItemService.getAllDonationItems(donationId);
      expect(items).toHaveLength(0);
    });

    it('should throw BadRequestException if there are existing associated allocations', async () => {
      const donationId = 3;

      const donation = await service.findOne(donationId);
      expect(donation).toBeDefined();
      expect(donation.status).toBe(DonationStatus.AVAILABLE);

      await expect(service.delete(donationId)).rejects.toThrow(
        `Cannot delete donation ${donationId} with existing allocations`,
      );
    });

    it('should throw BadRequestException if there is a donation item with reservedQuantity', async () => {
      const donationId = 3;

      const donation = await service.findOne(donationId);
      expect(donation).toBeDefined();
      expect(donation.status).toBe(DonationStatus.AVAILABLE);

      await testDataSource
        .getRepository(DonationItem)
        .update(7, { reservedQuantity: 1 });

      await expect(service.delete(donationId)).rejects.toThrow(
        `Cannot delete donation ${donationId} as it has a donation item with reserved quantity`,
      );
    });

    it('should throw NotFoundException if donation does not exist', async () => {
      await expect(service.delete(9999)).rejects.toThrow(
        `Donation 9999 not found`,
      );
    });

    it('should throw BadRequestException if donation is not AVAILABLE', async () => {
      // donation with status MATCHED
      const donationId = 2;

      await expect(service.delete(donationId)).rejects.toThrow(
        'Only available donations can be deleted',
      );
    });
  });

  describe('confirmDonationItemDetails', () => {
    const makeDto = (itemId: number): ConfirmDonationItemDetailsDto => ({
      itemId,
      ozPerItem: 5.0,
      estimatedValue: 10.0,
      foodRescue: true,
    });

    it('throws NotFoundException when donation does not exist', async () => {
      await expect(
        service.confirmDonationItemDetails(9999, [makeDto(1)]),
      ).rejects.toThrow(new NotFoundException('Donation 9999 not found'));
    });

    it('throws BadRequestException when donation status is not MATCHED', async () => {
      // seed donation 1 has status 'available' — status check fires before item lookup
      await expect(
        service.confirmDonationItemDetails(1, [makeDto(1)]),
      ).rejects.toThrow(
        new BadRequestException(
          `Donation status must be ${DonationStatus.MATCHED}`,
        ),
      );
    });

    it('returns the donation after confirming item details, as well as fulfills donation', async () => {
      const donationId = await insertMatchedDonation();
      const itemId = await insertDonationItem(donationId, 10, 10);

      const spy = jest.spyOn(service, 'checkAndFulfillDonation');

      const result = await service.confirmDonationItemDetails(donationId, [
        makeDto(itemId),
      ]);

      expect(result).toBeDefined();
      expect(result.donationId).toBe(donationId);
      expect(result.status).toBe(DonationStatus.FULFILLED);
      expect(result.donationItems.every((item) => item.detailsConfirmed)).toBe(
        true,
      );
      const dbDonation = await service.findOne(donationId);
      expect(dbDonation.status).toBe(DonationStatus.FULFILLED);
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('checkAndFulfillDonation', () => {
    async function insertConfirmedDonationItem(
      donationId: number,
      qty: number,
      reserved: number,
    ): Promise<number> {
      const result = await testDataSource.query(
        `INSERT INTO donation_items
          (donation_id, item_name, quantity, reserved_quantity, food_type, details_confirmed)
         VALUES ($1, 'Test Item', $2, $3, 'Granola', true)
         RETURNING item_id`,
        [donationId, qty, reserved],
      );
      return result[0].item_id;
    }

    it('returns donation unchanged when not all items are fulfilled', async () => {
      const donationId = await insertMatchedDonation();
      // reservedQuantity (5) != quantity (10), detailsConfirmed = false
      await insertDonationItem(donationId, 10, 10);

      const donation = await service.findOne(donationId);
      const result = await service.checkAndFulfillDonation(donation);

      expect(result.status).toBe(DonationStatus.MATCHED);
      const dbDonation = await service.findOne(donationId);
      expect(dbDonation.status).toBe(DonationStatus.MATCHED);
    });

    it('returns donation unchanged when not all items have reservedQuantity = quantity', async () => {
      const donationId = await insertMatchedDonation();
      // reservedQuantity (5) != quantity (10), detailsConfirmed = false
      await insertDonationItem(donationId, 10, 5);

      const donation = await service.findOne(donationId);
      const result = await service.checkAndFulfillDonation(donation);

      expect(result.status).toBe(DonationStatus.MATCHED);
      const dbDonation = await service.findOne(donationId);
      expect(dbDonation.status).toBe(DonationStatus.MATCHED);
    });

    it('returns donation unchanged when there is a pending order', async () => {
      const donationId = await insertMatchedDonation();
      // fully reserved and confirmed, but order 4 is PENDING
      const itemId = await insertConfirmedDonationItem(donationId, 10, 10);
      await insertAllocation(4, itemId);

      const donation = await service.findOne(donationId);
      const result = await service.checkAndFulfillDonation(donation);

      expect(result.status).toBe(DonationStatus.MATCHED);
      const dbDonation = await service.findOne(donationId);
      expect(dbDonation.status).toBe(DonationStatus.MATCHED);
    });

    it('sets donation to FULFILLED when all items confirmed, fully reserved, and no pending orders', async () => {
      const donationId = await insertMatchedDonation();
      await insertConfirmedDonationItem(donationId, 10, 10);

      const donation = await service.findOne(donationId);
      const result = await service.checkAndFulfillDonation(donation);

      expect(result.status).toBe(DonationStatus.FULFILLED);
      const dbDonation = await service.findOne(donationId);
      expect(dbDonation.status).toBe(DonationStatus.FULFILLED);
    });
  });
});
