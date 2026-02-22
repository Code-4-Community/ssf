import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Donation } from './donations.entity';
import { validateId } from '../utils/validation.utils';
import { DonationStatus, RecurrenceEnum } from './types';
import { CreateDonationDto } from './dtos/create-donation.dto';
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
    const donation = this.repo.create({
      foodManufacturer: manufacturer,
      dateDonated: donationData.dateDonated,
      status: donationData.status,
      totalItems: donationData.totalItems,
      totalOz: donationData.totalOz,
      totalEstimatedValue: donationData.totalEstimatedValue,
      recurrence: donationData.recurrence,
      recurrenceFreq: donationData.recurrenceFreq,
      nextDonationDates: donationData.nextDonationDates,
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

        if (occurrences > 0 && donation.recurrence !== RecurrenceEnum.NONE) {
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
              dates.sort((a, b) => a.getTime() - b.getTime());
            }
          }
        }
      }

      if (occurrencesUpdated) {
        await this.repo.update(donation.donationId, {
          nextDonationDates: dates,
          occurrencesRemaining: occurrences,
        });
      }
    }
  }

  private calculateNextDate(
    currentDate: Date,
    recurrence: RecurrenceEnum,
    recurrenceFreq = 1,
  ): Date {
    const nextDate = new Date(currentDate);
    switch (recurrence) {
      case RecurrenceEnum.WEEKLY:
        nextDate.setDate(nextDate.getDate() + 7 * recurrenceFreq);
        break;
      case RecurrenceEnum.MONTHLY:
        nextDate.setMonth(nextDate.getMonth() + recurrenceFreq);
        break;
      case RecurrenceEnum.YEARLY:
        nextDate.setFullYear(nextDate.getFullYear() + recurrenceFreq);
        break;
      default:
        break;
    }
    return nextDate;
  }
}
