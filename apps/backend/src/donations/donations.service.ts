import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Donation } from './donations.entity';
import { validateId } from '../utils/validation.utils';
import { DayOfWeek, DonationStatus, RecurrenceEnum } from './types';
import { CreateDonationDto, RepeatOnDaysDto } from './dtos/create-donation.dto';
import { FoodManufacturer } from '../foodManufacturers/manufacturers.entity';

@Injectable()
export class DonationService {
  private readonly logger = new Logger(DonationService.name);

  constructor(
    @InjectRepository(Donation) private repo: Repository<Donation>,
    @InjectRepository(FoodManufacturer)
    private manufacturerRepo: Repository<FoodManufacturer>,
  ) {}

  async findOne(donationId: number): Promise<Donation> {
    validateId(donationId, 'Donation');

    const donation = await this.repo.findOne({
      where: { donationId },
      relations: ['foodManufacturer'],
    });
    if (!donation) {
      throw new NotFoundException(`Donation ${donationId} not found`);
    }
    return donation;
  }

  async getAll() {
    return this.repo.find({
      relations: ['foodManufacturer'],
    });
  }

  async getNumberOfDonations(): Promise<number> {
    return this.repo.count();
  }

  async create(donationData: CreateDonationDto): Promise<Donation> {
    validateId(donationData.foodManufacturerId, 'Food Manufacturer');
    const manufacturer = await this.manufacturerRepo.findOne({
      where: { foodManufacturerId: donationData.foodManufacturerId },
    });

    if (!manufacturer) {
      throw new NotFoundException(
        `Food Manufacturer ${donationData.foodManufacturerId} not found`,
      );
    }

    let nextDonationDates = null;

    if (donationData.recurrence !== RecurrenceEnum.NONE) {
      if (donationData.recurrenceFreq == null) {
        throw new BadRequestException(
          'recurrenceFreq is required for recurring donations',
        );
      }

      nextDonationDates = await this.generateNextDonationDates(
        new Date(),
        donationData.recurrenceFreq,
        donationData.recurrence,
        donationData.repeatOnDays ?? null,
      );
    }

    const donation = this.repo.create({
      foodManufacturer: manufacturer,
      dateDonated: new Date(),
      status: DonationStatus.AVAILABLE,
      totalItems: donationData.totalItems,
      totalOz: donationData.totalOz,
      totalEstimatedValue: donationData.totalEstimatedValue,
      recurrence: donationData.recurrence,
      recurrenceFreq: donationData.recurrenceFreq,
      nextDonationDates: nextDonationDates,
      occurrencesRemaining: donationData.occurrencesRemaining,
    });

    return this.repo.save(donation);
  }

  async fulfill(donationId: number): Promise<Donation> {
    validateId(donationId, 'Donation');

    const donation = await this.repo.findOneBy({ donationId });
    if (!donation) {
      throw new NotFoundException(`Donation ${donationId} not found`);
    }
    donation.status = DonationStatus.FULFILLED;
    return this.repo.save(donation);
  }

  async handleRecurringDonations(): Promise<void> {
    const donations = await this.getAll();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const donation of donations) {
      if (
        !donation.nextDonationDates ||
        donation.nextDonationDates.length === 0
      ) {
        continue;
      }

      if (donation.recurrence === RecurrenceEnum.NONE) continue;

      if (
        !donation.occurrencesRemaining ||
        donation.occurrencesRemaining <= 0
      ) {
        await this.repo.update(donation.donationId, {
          nextDonationDates: [],
          occurrencesRemaining: 0,
        });
        continue;
      }

      let dates = [...donation.nextDonationDates].sort(
        (a, b) => a.getTime() - b.getTime(),
      );

      let occurrences = donation.occurrencesRemaining;
      let occurrencesUpdated = false;

      for (let i = 0; i < dates.length; i++) {
        const currentDate = dates[i];

        // all remaining dates are in future
        if (currentDate.getTime() > today.getTime()) {
          break;
        }

        // recurrence has ended, clear nextDonationDates
        if (occurrences <= 0) {
          dates = [];
          occurrencesUpdated = true;
          break;
        }

        this.logger.log(`Placeholder for sending automated email`);

        /**
         * IMPORTANT: future logic below should only proceed if the email is successfully sent
         */
        const emailSent = true;
        if (!emailSent) continue;

        dates.splice(i, 1);
        i--;
        occurrences -= 1;
        occurrencesUpdated = true;

        if (occurrences > 0) {
          let nextDate = this.calculateNextDate(
            currentDate,
            donation.recurrence,
            donation.recurrenceFreq,
          );

          // cascading recalculation of next dates when replacement dates are also expired
          while (nextDate.getTime() <= today.getTime() && occurrences > 0) {
            this.logger.log(
              `Placeholder for sending automated email for replacement date`,
            );
            const cascadeEmailSent = true;
            if (!cascadeEmailSent) break;

            occurrences -= 1;

            if (occurrences > 0) {
              nextDate = this.calculateNextDate(
                nextDate,
                donation.recurrence,
                donation.recurrenceFreq,
              );
            }
          }

          if (occurrences > 0) {
            const alreadyExists = dates.some(
              (date) => date.getTime() === nextDate.getTime(),
            );
            if (!alreadyExists) {
              dates.push(nextDate);
            }
          }
        }
      }

      if (occurrencesUpdated) {
        dates.sort((a, b) => a.getTime() - b.getTime());

        await this.repo.update(donation.donationId, {
          nextDonationDates: dates,
          occurrencesRemaining: occurrences,
        });
      }
    }
  }

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
   * @param currentDate - date to calculate from (typically an expired donation date)
   * @param recurrence - recurrence type (WEEKLY, MONTHLY, YEARLY, or NONE)
   * @param recurrenceFreq - how many weeks/months/years to add (defaults to 1)
   * @returns a new Date representing the next occurrence
   */
  private calculateNextDate(
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
      default:
        break;
    }
    return nextDate;
  }

  /**
   * Generates the initial set of next donation dates when creating a new recurring donation.
   *
   * WEEKLY recurrence: returns multiple dates if multiple DOWs are selected
   * dates offset by recurrenceFreq weeks from the fromDate
   *
   * MONTHLY/YEARLY recurrence: returns single date offset by recurrenceFreq months/years
   * dates clamped to 28th to avoid month-end rollover issues
   *
   * @param fromDate - base date to calculate from (typically current date at donation creation)
   * @param recurrenceFreq - how many weeks/months/years between occurrences
   * @param recurrence - recurrence type (WEEKLY, MONTHLY, YEARLY, or NONE)
   * @param repeatOnDays - for WEEKLY recurrence only: which DOW to repeat on
   * @returns array of IOS date strings representing initial scheduled donation dates
   */
  async generateNextDonationDates(
    fromDate: Date,
    recurrenceFreq: number,
    recurrence: RecurrenceEnum,
    repeatOnDays: RepeatOnDaysDto | null = null,
  ): Promise<string[]> {
    const dates: string[] = [];

    if (recurrence === RecurrenceEnum.WEEKLY) {
      const selectedDays = repeatOnDays
        ? (Object.keys(repeatOnDays) as DayOfWeek[]).filter(
            (day) => repeatOnDays[day],
          )
        : [];
      if (selectedDays.length === 0) return [];

      const daysOfWeek: DayOfWeek[] = [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
      ];

      const startDay = recurrenceFreq > 1 ? recurrenceFreq * 7 : 1;

      for (let i = startDay; i <= startDay + 6; i++) {
        const nextDay = daysOfWeek[(fromDate.getDay() + i) % 7];
        if (selectedDays.includes(nextDay)) {
          const nextDate = new Date(fromDate);
          nextDate.setDate(fromDate.getDate() + i);
          dates.push(nextDate.toISOString());
        }
      }
    } else if (recurrence === RecurrenceEnum.MONTHLY) {
      const nextDate = new Date(fromDate);
      // Date clamp if the day is later than 28th
      if (nextDate.getDate() > 28) nextDate.setDate(28);
      nextDate.setMonth(fromDate.getMonth() + recurrenceFreq);
      dates.push(nextDate.toISOString());
    } else if (recurrence === RecurrenceEnum.YEARLY) {
      const nextDate = new Date(fromDate);
      // Date clamp if the day is later than 28th
      if (nextDate.getDate() > 28) nextDate.setDate(28);
      nextDate.setFullYear(fromDate.getFullYear() + recurrenceFreq);
      dates.push(nextDate.toISOString());
    }
    return dates;
  }
}
