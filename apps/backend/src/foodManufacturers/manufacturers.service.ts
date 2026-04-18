import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FoodManufacturer } from './manufacturers.entity';
import { Repository } from 'typeorm';
import { validateId } from '../utils/validation.utils';
import { FoodManufacturerApplicationDto } from './dtos/manufacturer-application.dto';
import { User } from '../users/users.entity';
import { Role } from '../users/types';
import { ApplicationStatus } from '../shared/types';
import { userSchemaDto } from '../users/dtos/userSchema.dto';
import { UsersService } from '../users/users.service';
import { Donation } from '../donations/donations.entity';
import { UpdateFoodManufacturerApplicationDto } from './dtos/update-manufacturer-application.dto';
import { emailTemplates, SSF_PARTNER_EMAIL } from '../emails/emailTemplates';
import { EmailsService } from '../emails/email.service';
import {
  DonationDetailsDto,
  DonationItemWithAllocatedQuantityDto,
  DonationOrderDetailsDto,
  DonationReminderDto,
} from './dtos/donation-details-dto';
import { OrderStatus } from '../orders/types';
import { DonationStatus, RecurrenceEnum } from '../donations/types';
import { calculateNextDonationDate } from '../donations/recurrence.utils';
import { ManufacturerStatsDto } from './dtos/manufacturer-stats.dto';

@Injectable()
export class FoodManufacturersService {
  constructor(
    @InjectRepository(FoodManufacturer)
    private repo: Repository<FoodManufacturer>,

    private usersService: UsersService,
    private emailsService: EmailsService,

    @InjectRepository(Donation)
    private donationsRepo: Repository<Donation>,
  ) {}

  async findOne(foodManufacturerId: number): Promise<FoodManufacturer> {
    validateId(foodManufacturerId, 'Food Manufacturer');

    const foodManufacturer = await this.repo.findOne({
      where: { foodManufacturerId },
      relations: ['foodManufacturerRepresentative'],
    });

    if (!foodManufacturer) {
      throw new NotFoundException(
        `Food Manufacturer ${foodManufacturerId} not found`,
      );
    }
    return foodManufacturer;
  }

  async getFMDonations(
    foodManufacturerId: number,
    currentUserId: number,
  ): Promise<DonationDetailsDto[]> {
    validateId(foodManufacturerId, 'Food Manufacturer');
    validateId(currentUserId, 'User');

    const manufacturer = await this.repo.findOne({
      where: { foodManufacturerId },
      relations: ['foodManufacturerRepresentative'],
    });

    if (!manufacturer) {
      throw new NotFoundException(
        `Food Manufacturer ${foodManufacturerId} not found`,
      );
    }

    if (manufacturer.foodManufacturerRepresentative.id !== currentUserId) {
      throw new ForbiddenException(
        `User ${currentUserId} is not allowed to access donations for Food Manufacturer ${foodManufacturerId}`,
      );
    }

    const donations = await this.donationsRepo
      .createQueryBuilder('donation')
      .leftJoinAndSelect('donation.foodManufacturer', 'foodManufacturer')
      .leftJoinAndSelect('donation.donationItems', 'donationItem')
      .leftJoinAndSelect('donationItem.allocations', 'allocation')
      .leftJoinAndSelect('allocation.order', 'order')
      .leftJoinAndSelect('order.request', 'request')
      .leftJoinAndSelect('request.pantry', 'pantry')
      .where('donation.food_manufacturer_id = :foodManufacturerId', {
        foodManufacturerId,
      })
      .getMany();

    return donations.map((donation) => {
      const orderMap = new Map<number, DonationOrderDetailsDto>();
      const relevantDonationItems: DonationItemWithAllocatedQuantityDto[] = [];

      if (donation.status === DonationStatus.MATCHED) {
        donation.donationItems?.forEach((item) => {
          const pendingAllocations = item.allocations.filter(
            (a) => a.order.status === OrderStatus.PENDING,
          );

          if (pendingAllocations.length === 0) return;

          if (!item.detailsConfirmed) {
            relevantDonationItems.push({
              itemId: item.itemId,
              itemName: item.itemName,
              foodType: item.foodType,
              allocatedQuantity: pendingAllocations.reduce(
                (sum, a) => sum + a.allocatedQuantity,
                0,
              ),
            });
          }

          pendingAllocations.forEach((a) => {
            const order = a.order;
            if (!orderMap.has(order.orderId)) {
              orderMap.set(order.orderId, {
                orderId: order.orderId,
                pantryId: order.request.pantry.pantryId,
                pantryName: order.request.pantry.pantryName,
              });
            }
          });
        });
      }

      return {
        donation,
        associatedPendingOrders: Array.from(orderMap.values()),
        relevantDonationItems,
      };
    });
  }

  async getUpcomingDonationReminders(
    foodManufacturerId: number,
  ): Promise<DonationReminderDto[]> {
    validateId(foodManufacturerId, 'Food Manufacturer');

    const manufacturer = await this.repo.findOneBy({ foodManufacturerId });

    if (!manufacturer) {
      throw new NotFoundException(
        `Food Manufacturer ${foodManufacturerId} not found`,
      );
    }

    const donations = await this.donationsRepo.find({
      where: { foodManufacturer: { foodManufacturerId } },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const donationReminders: DonationReminderDto[] = donations.flatMap(
      (donation) => {
        const dates = donation.nextDonationDates ?? [];
        const reminders: DonationReminderDto[] = dates.map((date) => ({
          donation,
          reminderDate: date,
        }));

        if (
          donation.recurrence !== RecurrenceEnum.NONE &&
          donation.recurrenceFreq &&
          dates.length > 0
        ) {
          for (const date of dates) {
            const nextDate = calculateNextDonationDate(
              date,
              donation.recurrence,
              donation.recurrenceFreq,
            );
            if (
              nextDate >= today &&
              !dates.some((d) => d.getTime() === nextDate.getTime())
            ) {
              reminders.push({ donation, reminderDate: nextDate });
            }
          }
        }

        return reminders;
      },
    );

    donationReminders.sort(
      (a, b) => a.reminderDate.getTime() - b.reminderDate.getTime(),
    );

    return donationReminders.slice(0, 2);
  }

  async getPendingManufacturers(): Promise<FoodManufacturer[]> {
    return await this.repo.find({
      where: { status: ApplicationStatus.PENDING },
      relations: ['foodManufacturerRepresentative'],
    });
  }

  async addFoodManufacturer(
    foodManufacturerData: FoodManufacturerApplicationDto,
  ) {
    const foodManufacturerContact: User = new User();
    const foodManufacturer: FoodManufacturer = new FoodManufacturer();

    // primary contact information
    foodManufacturerContact.role = Role.FOODMANUFACTURER;
    foodManufacturerContact.firstName = foodManufacturerData.contactFirstName;
    foodManufacturerContact.lastName = foodManufacturerData.contactLastName;
    foodManufacturerContact.email = foodManufacturerData.contactEmail;
    foodManufacturerContact.phone = foodManufacturerData.contactPhone;

    foodManufacturer.foodManufacturerRepresentative = foodManufacturerContact;

    // secondary contact information
    foodManufacturer.secondaryContactFirstName =
      foodManufacturerData.secondaryContactFirstName ?? null;
    foodManufacturer.secondaryContactLastName =
      foodManufacturerData.secondaryContactLastName ?? null;
    foodManufacturer.secondaryContactEmail =
      foodManufacturerData.secondaryContactEmail ?? null;
    foodManufacturer.secondaryContactPhone =
      foodManufacturerData.secondaryContactPhone ?? null;

    // food manufacturer details information
    foodManufacturer.foodManufacturerName =
      foodManufacturerData.foodManufacturerName;
    foodManufacturer.foodManufacturerWebsite =
      foodManufacturerData.foodManufacturerWebsite;
    foodManufacturer.unlistedProductAllergens =
      foodManufacturerData.unlistedProductAllergens;
    foodManufacturer.facilityFreeAllergens =
      foodManufacturerData.facilityFreeAllergens;
    foodManufacturer.productsGlutenFree =
      foodManufacturerData.productsGlutenFree;
    foodManufacturer.productsContainSulfites =
      foodManufacturerData.productsContainSulfites;
    foodManufacturer.productsSustainableExplanation =
      foodManufacturerData.productsSustainableExplanation;
    foodManufacturer.inKindDonations = foodManufacturerData.inKindDonations;
    foodManufacturer.donateWastedFood = foodManufacturerData.donateWastedFood;
    foodManufacturer.manufacturerAttribute =
      foodManufacturerData.manufacturerAttribute ?? null;
    foodManufacturer.additionalComments =
      foodManufacturerData.additionalComments ?? null;
    foodManufacturer.newsletterSubscription =
      foodManufacturerData.newsletterSubscription ?? null;

    await this.repo.save(foodManufacturer);

    try {
      const manufacturerMessage =
        emailTemplates.pantryFmApplicationSubmittedToUser({
          name: foodManufacturerContact.firstName,
        });

      await this.emailsService.sendEmails(
        [foodManufacturerContact.email],
        manufacturerMessage.subject,
        manufacturerMessage.bodyHTML,
      );
    } catch {
      throw new InternalServerErrorException(
        'Failed to send food manufacturer application submitted confirmation email to representative',
      );
    }

    try {
      const adminMessage = emailTemplates.pantryFmApplicationSubmittedToAdmin();
      await this.emailsService.sendEmails(
        [SSF_PARTNER_EMAIL],
        adminMessage.subject,
        adminMessage.bodyHTML,
      );
    } catch {
      throw new InternalServerErrorException(
        'Failed to send new food manufacturer application notification email to SSF',
      );
    }
  }

  async updateFoodManufacturerApplication(
    manufacturerId: number,
    foodManufacturerData: UpdateFoodManufacturerApplicationDto,
    currentUserId: number,
  ) {
    validateId(manufacturerId, 'Food Manufacturer');
    validateId(currentUserId, 'User');

    const manufacturer = await this.repo.findOne({
      where: { foodManufacturerId: manufacturerId },
      relations: ['foodManufacturerRepresentative'],
    });

    if (!manufacturer) {
      throw new NotFoundException(
        `Food Manufacturer ${manufacturerId} not found`,
      );
    }

    if (manufacturer.foodManufacturerRepresentative.id !== currentUserId) {
      throw new ForbiddenException(
        `User ${currentUserId} is not allowed to edit application for Food Manufacturer ${manufacturerId}`,
      );
    }

    Object.assign(manufacturer, foodManufacturerData);

    return await this.repo.save(manufacturer);
  }

  async approve(id: number) {
    validateId(id, 'Food Manufacturer');

    const foodManufacturer = await this.repo.findOne({
      where: { foodManufacturerId: id },
      relations: ['foodManufacturerRepresentative'],
    });
    if (!foodManufacturer) {
      throw new NotFoundException(`Food Manufacturer ${id} not found`);
    }

    if (foodManufacturer.status !== ApplicationStatus.PENDING) {
      throw new ConflictException(
        `Cannot approve a Food Manufacturer with status: ${foodManufacturer.status}`,
      );
    }

    const createUserDto: userSchemaDto = {
      ...foodManufacturer.foodManufacturerRepresentative,
      role: Role.FOODMANUFACTURER,
    };

    const newFoodManufacturer = await this.usersService.create(createUserDto);

    await this.repo.update(id, {
      status: ApplicationStatus.APPROVED,
      foodManufacturerRepresentative: newFoodManufacturer,
    });

    try {
      const message = emailTemplates.pantryFmApplicationApproved({
        name: newFoodManufacturer.firstName,
      });

      await this.emailsService.sendEmails(
        [newFoodManufacturer.email],
        message.subject,
        message.bodyHTML,
      );
    } catch {
      throw new InternalServerErrorException(
        'Failed to send food manufacturer account approved notification email to representative',
      );
    }
  }

  async deny(id: number) {
    validateId(id, 'Food Manufacturer');

    const foodManufacturer = await this.repo.findOne({
      where: { foodManufacturerId: id },
      relations: ['foodManufacturerRepresentative'],
    });

    if (!foodManufacturer) {
      throw new NotFoundException(`Food Manufacturer ${id} not found`);
    }

    if (foodManufacturer.status !== ApplicationStatus.PENDING) {
      throw new ConflictException(
        `Cannot deny a Food Manufacturer with status: ${foodManufacturer.status}`,
      );
    }

    await this.repo.update(id, { status: ApplicationStatus.DENIED });
  }

  async getStats(id: number): Promise<ManufacturerStatsDto> {
    validateId(id, 'Food Manufacturer');

    const manufacturer = await this.repo.findOne({
      where: { foodManufacturerId: id },
    });

    if (!manufacturer) {
      throw new NotFoundException(`Food Manufacturer ${id} not found`);
    }

    const result = await this.repo
      .createQueryBuilder('fm')
      .leftJoin('fm.donations', 'd')
      .leftJoin('d.donationItems', 'di')
      .where('fm.foodManufacturerId = :id', { id })
      .select([
        'COUNT(DISTINCT d.donationId) AS donations',
        'COALESCE(SUM(di.estimatedValue * di.quantity), 0) AS total_value',
        'COALESCE(SUM(di.quantity), 0) AS total_items',
        'COALESCE(SUM(di.quantity * di.ozPerItem) / 16.0, 0) AS total_lbs',
      ])
      .getRawOne();

    return {
      Donations: String(result.donations),
      'Value Donated': `$${Number(result.total_value)}`,
      'Items Donated': String(result.total_items),
      'lbs Donated': `${Number(result.total_lbs)}`,
    };
  }
}
