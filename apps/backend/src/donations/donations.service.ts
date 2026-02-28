import {
  BadRequestException,
  Injectable,
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
        donationData.recurrenceFreq,
        donationData.recurrence,
        donationData.repeatOnDays ?? null,
      );
    }

    const donation = this.repo.create({
      foodManufacturer: manufacturer,
      dateDonated: new Date(),
      status: DonationStatus.AVAILABLE,
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
    console.log('Accessing donation service from cron job');
    // TODO: Implement logic for sending reminder emails
  }

  async generateNextDonationDates(
    recurrenceFreq: number,
    recurrence: RecurrenceEnum,
    repeatOnDays: RepeatOnDaysDto | null,
  ): Promise<string[]> {
    const today = new Date();
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
        const nextDay = daysOfWeek[(today.getDay() + i) % 7];
        if (selectedDays.includes(nextDay)) {
          const nextDate = new Date(today);
          nextDate.setDate(today.getDate() + i);
          dates.push(nextDate.toISOString());
        }
      }
    } else if (recurrence === RecurrenceEnum.MONTHLY) {
      const nextDate = new Date(today);
      // Date clamp if the day is later than 28th
      if (nextDate.getDate() > 28) nextDate.setDate(28);
      nextDate.setMonth(today.getMonth() + recurrenceFreq);
      dates.push(nextDate.toISOString());
    } else if (recurrence === RecurrenceEnum.YEARLY) {
      const nextDate = new Date(today);
      // Date clamp if the day is later than 28th
      if (nextDate.getDate() > 28) nextDate.setDate(28);
      nextDate.setFullYear(today.getFullYear() + recurrenceFreq);
      dates.push(nextDate.toISOString());
    }
    return dates;
  }
}
