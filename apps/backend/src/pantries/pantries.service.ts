import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Pantry } from './pantries.entity';
import { Order } from '../orders/order.entity';
import { FoodRequest } from '../foodRequests/request.entity';
import { Allocation } from '../allocations/allocations.entity';
import { DonationItem } from '../donationItems/donationItems.entity';
import { User } from '../users/users.entity';
import { hasDuplicates, validateId } from '../utils/validation.utils';
import { ApplicationStatus } from '../shared/types';
import { PantryApplicationDto } from './dtos/pantry-application.dto';
import { Role } from '../users/types';
import { ApprovedPantryResponse } from './types';
import { PantryStats, TotalStats } from './types';
import { userSchemaDto } from '../users/dtos/userSchema.dto';
import { UsersService } from '../users/users.service';
import { UpdatePantryApplicationDto } from './dtos/update-pantry-application.dto';
import { emailTemplates, SSF_PARTNER_EMAIL } from '../emails/emailTemplates';
import { EmailsService } from '../emails/email.service';
import { PantryStatsDto } from './dtos/pantry-stats.dto';
import { UpdatePantryVolunteersDto } from './dtos/update-pantry-volunteers-dto';

@Injectable()
export class PantriesService {
  constructor(
    @InjectRepository(Pantry) private repo: Repository<Pantry>,
    @InjectRepository(Order) private orderRepo: Repository<Order>,

    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,

    @Inject(forwardRef(() => EmailsService))
    private emailsService: EmailsService,
  ) {}

  async findOne(pantryId: number): Promise<Pantry> {
    validateId(pantryId, 'Pantry');

    const pantry = await this.repo.findOne({
      where: { pantryId },
      relations: ['pantryUser'],
    });

    if (!pantry) {
      throw new NotFoundException(`Pantry ${pantryId} not found`);
    }
    return pantry;
  }

  private readonly EMPTY_STATS: Omit<PantryStats, 'pantryId' | 'pantryName'> = {
    totalItems: 0,
    totalOz: 0,
    totalLbs: 0,
    totalDonatedFoodValue: 0,
    totalShippingCost: 0,
    totalValue: 0,
    percentageFoodRescueItems: 0,
  };

  private async aggregateStats(
    pantryIds: number[],
    years?: number[],
  ): Promise<Omit<PantryStats, 'pantryName'>[]> {
    // Query 1: aggregate item stats (totalItems, totalOz, totalDonatedFoodValue, totalFoodRescueItems)
    const itemsQb = this.orderRepo
      .createQueryBuilder('order')
      .leftJoin('order.request', 'request')
      .leftJoin('order.allocations', 'allocation')
      .leftJoin('allocation.item', 'item')
      .select('request.pantryId', 'pantryId')
      .addSelect('COALESCE(SUM(allocation.allocatedQuantity), 0)', 'totalItems')
      .addSelect(
        'COALESCE(SUM(COALESCE(item.ozPerItem, 0) * allocation.allocatedQuantity), 0)',
        'totalOz',
      )
      .addSelect(
        'COALESCE(SUM(COALESCE(item.estimatedValue, 0) * allocation.allocatedQuantity), 0)',
        'totalDonatedFoodValue',
      )
      .addSelect(
        `COALESCE(SUM(CASE WHEN item.foodRescue = true THEN allocation.allocatedQuantity ELSE 0 END), 0)`,
        'totalFoodRescueItems',
      )
      .where('request.pantryId IN (:...pantryIds)', { pantryIds })
      .groupBy('request.pantryId');

    if (years?.length) {
      itemsQb.andWhere('EXTRACT(YEAR FROM order.createdAt) IN (:...years)', {
        years,
      });
    }

    // Query 2: aggregate shipping cost per pantry (no allocation join, so no double counting)
    const shippingQb = this.orderRepo
      .createQueryBuilder('order')
      .leftJoin('order.request', 'request')
      .select('request.pantryId', 'pantryId')
      .addSelect('COALESCE(SUM(order.shippingCost), 0)', 'totalShippingCost')
      .where('request.pantryId IN (:...pantryIds)', { pantryIds })
      .groupBy('request.pantryId');

    if (years?.length) {
      shippingQb.andWhere('EXTRACT(YEAR FROM order.createdAt) IN (:...years)', {
        years,
      });
    }

    const [itemRows, shippingRows] = await Promise.all([
      itemsQb.getRawMany(),
      shippingQb.getRawMany(),
    ]);

    // Efficiently merge the two query results
    const shippingMap = new Map(
      shippingRows.map((r) => [
        Number(r.pantryId),
        Number(r.totalShippingCost),
      ]),
    );

    return itemRows.map((row) => {
      const totalItems = Number(row.totalItems);
      const totalOz = Number(row.totalOz);
      const totalDonatedFoodValue = Number(row.totalDonatedFoodValue);
      const totalShippingCost = shippingMap.get(Number(row.pantryId)) ?? 0;
      const totalFoodRescueItems = Number(row.totalFoodRescueItems);

      return {
        pantryId: Number(row.pantryId),
        totalItems,
        totalOz,
        totalLbs: parseFloat((totalOz / 16).toFixed(2)),
        totalDonatedFoodValue,
        totalShippingCost,
        totalValue: totalDonatedFoodValue + totalShippingCost,
        percentageFoodRescueItems:
          totalItems > 0
            ? parseFloat(((totalFoodRescueItems / totalItems) * 100).toFixed(2))
            : 0,
      } satisfies Omit<PantryStats, 'pantryName'>;
    });
  }

  async getPantryStats(
    pantryNames?: string[],
    years?: number[],
    page = 1,
  ): Promise<PantryStats[]> {
    const PAGE_SIZE = 10;

    if (page < 1) {
      throw new BadRequestException('Page number must be greater than 0');
    }

    let paginated: { pantryId: number; pantryName: string }[];

    // If names were provided, validate ALL of them before paginating
    if (pantryNames?.length) {
      const allMatched = await this.repo.find({
        select: ['pantryId', 'pantryName', 'status'],
        where: { pantryName: In(pantryNames) },
        order: { pantryId: 'ASC' },
      });

      const missingNames = pantryNames.filter(
        (name) => !allMatched.some((p) => p.pantryName === name),
      );
      if (missingNames.length > 0) {
        throw new NotFoundException(
          `Pantries not found: ${missingNames.join(', ')}`,
        );
      }

      const unapprovedNames = allMatched
        .filter((p) => p.status !== ApplicationStatus.APPROVED)
        .map((p) => p.pantryName);
      if (unapprovedNames.length > 0) {
        throw new NotFoundException(
          `Pantries not approved: ${unapprovedNames.join(', ')}`,
        );
      }

      paginated = allMatched.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    } else {
      paginated = await this.repo.find({
        select: ['pantryId', 'pantryName'],
        where: { status: ApplicationStatus.APPROVED },
        order: { pantryId: 'ASC' },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      });
    }

    if (paginated.length === 0) return [];

    const pantryIds = paginated.map((p) => p.pantryId);
    const stats = await this.aggregateStats(pantryIds, years);
    const statsMap = new Map(stats.map((s) => [s.pantryId, s]));

    return paginated.map((p) => {
      const stat = statsMap.get(p.pantryId);
      return stat
        ? { ...stat, pantryName: p.pantryName }
        : {
            pantryId: p.pantryId,
            pantryName: p.pantryName,
            ...this.EMPTY_STATS,
          };
    });
  }

  async getTotalStats(years?: number[]): Promise<TotalStats> {
    const pantries = await this.repo.find({
      select: ['pantryId'],
      where: { status: ApplicationStatus.APPROVED },
    });

    if (pantries.length === 0) {
      return { ...this.EMPTY_STATS };
    }

    const pantryIds = pantries.map((p) => p.pantryId);
    const stats = await this.aggregateStats(pantryIds, years);

    const totalStats = { ...this.EMPTY_STATS };
    let totalFoodRescueItems = 0;

    for (const s of stats) {
      totalStats.totalItems += s.totalItems;
      totalStats.totalOz += s.totalOz;
      totalStats.totalDonatedFoodValue += s.totalDonatedFoodValue;
      totalStats.totalShippingCost += s.totalShippingCost;
      totalStats.totalValue += s.totalValue;
      totalFoodRescueItems +=
        (s.percentageFoodRescueItems / 100) * s.totalItems;
    }

    totalStats.totalLbs = parseFloat((totalStats.totalOz / 16).toFixed(2));
    totalStats.percentageFoodRescueItems =
      totalStats.totalItems > 0
        ? parseFloat(
            ((totalFoodRescueItems / totalStats.totalItems) * 100).toFixed(2),
          )
        : 0;

    return totalStats;
  }

  async getPendingPantries(): Promise<Pantry[]> {
    return await this.repo.find({
      where: { status: ApplicationStatus.PENDING },
      relations: ['pantryUser'],
    });
  }

  async getApprovedPantryNames(): Promise<string[]> {
    const pantries = await this.repo.find({
      select: ['pantryName'],
      where: { status: ApplicationStatus.APPROVED },
    });
    return pantries.map((p) => p.pantryName);
  }

  async getPantryAdminStatsOrderYears(): Promise<number[]> {
    const rows = await this.orderRepo
      .createQueryBuilder('order')
      .select('EXTRACT(YEAR FROM order.createdAt)::int', 'year')
      .groupBy('EXTRACT(YEAR FROM order.createdAt)::int')
      .orderBy('"year"', 'DESC')
      .getRawMany();

    return rows.map((r) => Number(r.year));
  }

  async addPantry(pantryData: PantryApplicationDto) {
    const pantryContact: User = new User();
    const pantry: Pantry = new Pantry();

    // primary contact information
    pantryContact.role = Role.PANTRY;
    pantryContact.firstName = pantryData.contactFirstName;
    pantryContact.lastName = pantryData.contactLastName;
    pantryContact.email = pantryData.contactEmail;
    pantryContact.phone = pantryData.contactPhone;

    pantry.pantryUser = pantryContact;
    pantry.hasEmailContact = pantryData.hasEmailContact;
    pantry.emailContactOther = pantryData.emailContactOther ?? null;

    // secondary contact information
    pantry.secondaryContactFirstName =
      pantryData.secondaryContactFirstName ?? null;
    pantry.secondaryContactLastName =
      pantryData.secondaryContactLastName ?? null;
    pantry.secondaryContactEmail = pantryData.secondaryContactEmail ?? null;
    pantry.secondaryContactPhone = pantryData.secondaryContactPhone ?? null;

    // food shipment address information
    pantry.shipmentAddressLine1 = pantryData.shipmentAddressLine1;
    pantry.shipmentAddressLine2 = pantryData.shipmentAddressLine2 ?? null;
    pantry.shipmentAddressCity = pantryData.shipmentAddressCity;
    pantry.shipmentAddressState = pantryData.shipmentAddressState;
    pantry.shipmentAddressZip = pantryData.shipmentAddressZip;
    pantry.shipmentAddressCountry = pantryData.shipmentAddressCountry ?? null;

    // mailing address information
    pantry.mailingAddressLine1 = pantryData.mailingAddressLine1;
    pantry.mailingAddressLine2 = pantryData.mailingAddressLine2 ?? null;
    pantry.mailingAddressCity = pantryData.mailingAddressCity;
    pantry.mailingAddressState = pantryData.mailingAddressState;
    pantry.mailingAddressZip = pantryData.mailingAddressZip;
    pantry.mailingAddressCountry = pantryData.mailingAddressCountry ?? null;

    // pantry details information
    pantry.pantryName = pantryData.pantryName;
    pantry.allergenClients = pantryData.allergenClients;
    pantry.restrictions = pantryData.restrictions;
    pantry.refrigeratedDonation = pantryData.refrigeratedDonation;
    pantry.dedicatedAllergyFriendly = pantryData.dedicatedAllergyFriendly;
    pantry.reserveFoodForAllergic = pantryData.reserveFoodForAllergic;
    pantry.reservationExplanation = pantryData.reservationExplanation ?? null;
    pantry.clientVisitFrequency = pantryData.clientVisitFrequency ?? null;
    pantry.identifyAllergensConfidence =
      pantryData.identifyAllergensConfidence ?? null;
    pantry.serveAllergicChildren = pantryData.serveAllergicChildren ?? null;
    pantry.activities = pantryData.activities;
    pantry.activitiesComments = pantryData.activitiesComments ?? null;
    pantry.itemsInStock = pantryData.itemsInStock;
    pantry.needMoreOptions = pantryData.needMoreOptions;
    pantry.newsletterSubscription = pantryData.newsletterSubscription ?? null;

    // pantry contact is automatically added to User table
    await this.repo.save(pantry);

    try {
      const pantryMessage = emailTemplates.pantryFmApplicationSubmittedToUser({
        name: pantryContact.firstName,
      });

      await this.emailsService.sendEmails(
        [pantryContact.email],
        pantryMessage.subject,
        pantryMessage.bodyHTML,
      );
    } catch {
      throw new InternalServerErrorException(
        'Failed to send pantry application submitted confirmation email to representative',
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
        'Failed to send new pantry application notification email to SSF',
      );
    }
  }

  async updatePantryApplication(
    pantryId: number,
    pantryData: UpdatePantryApplicationDto,
    currentUserId: number,
  ) {
    validateId(pantryId, 'Pantry');
    validateId(currentUserId, 'User');

    const pantry = await this.repo.findOne({
      where: { pantryId },
      relations: ['pantryUser'],
    });

    if (!pantry) {
      throw new NotFoundException(`Pantry ${pantryId} not found`);
    }

    if (pantry.pantryUser.id !== currentUserId) {
      throw new BadRequestException(
        `User ${currentUserId} is not allowed to edit application for Pantry ${pantryId}`,
      );
    }

    Object.assign(pantry, pantryData);

    return await this.repo.save(pantry);
  }

  async approve(id: number) {
    validateId(id, 'Pantry');

    const pantry = await this.repo.findOne({
      where: { pantryId: id },
      relations: ['pantryUser'],
    });
    if (!pantry) {
      throw new NotFoundException(`Pantry ${id} not found`);
    }

    if (pantry.status !== ApplicationStatus.PENDING) {
      throw new ConflictException(
        `Cannot approve a pantry with status: ${pantry.status}`,
      );
    }

    const createUserDto: userSchemaDto = {
      ...pantry.pantryUser,
      role: Role.PANTRY,
    };

    const newPantryUser = await this.usersService.create(createUserDto);

    await this.repo.update(id, {
      status: ApplicationStatus.APPROVED,
      pantryUser: newPantryUser,
    });

    try {
      const message = emailTemplates.pantryFmApplicationApproved({
        name: newPantryUser.firstName,
      });

      await this.emailsService.sendEmails(
        [newPantryUser.email],
        message.subject,
        message.bodyHTML,
      );
    } catch {
      throw new InternalServerErrorException(
        'Failed to send pantry account approved notification email to representative',
      );
    }
  }

  async deny(id: number) {
    validateId(id, 'Pantry');

    const pantry = await this.repo.findOne({ where: { pantryId: id } });
    if (!pantry) {
      throw new NotFoundException(`Pantry ${id} not found`);
    }

    if (pantry.status !== ApplicationStatus.PENDING) {
      throw new ConflictException(
        `Cannot deny a pantry with status: ${pantry.status}`,
      );
    }

    await this.repo.update(id, { status: ApplicationStatus.DENIED });
  }

  async getApprovedPantriesWithVolunteers(): Promise<ApprovedPantryResponse[]> {
    const pantries = await this.repo.find({
      where: { status: ApplicationStatus.APPROVED },
      relations: ['volunteers', 'pantryUser'],
    });

    return pantries.map((pantry) => ({
      pantryId: pantry.pantryId,
      pantryName: pantry.pantryName,
      refrigeratedDonation: pantry.refrigeratedDonation,
      volunteers: (pantry.volunteers || []).map((volunteer) => ({
        userId: volunteer.id,
        firstName: volunteer.firstName,
        lastName: volunteer.lastName,
        email: volunteer.email,
        phone: volunteer.phone,
      })),
    }));
  }

  async updatePantryVolunteers(
    pantryId: number,
    body: UpdatePantryVolunteersDto,
  ): Promise<void> {
    const { addVolunteerIds = [], removeVolunteerIds = [] } = body;

    validateId(pantryId, 'Pantry');
    if (addVolunteerIds.length === 0 && removeVolunteerIds.length === 0) return;

    if (hasDuplicates(addVolunteerIds)) {
      throw new BadRequestException(
        'addVolunteerIds contains duplicate values',
      );
    }

    if (hasDuplicates(removeVolunteerIds)) {
      throw new BadRequestException(
        'removeVolunteerIds contains duplicate values',
      );
    }

    const addSet = new Set(addVolunteerIds);
    const removeSet = new Set(removeVolunteerIds);

    const overlap = addVolunteerIds.filter((id) => removeSet.has(id));
    if (overlap.length) {
      throw new BadRequestException(
        `The following ID(s) appear in both the add and remove lists: ${overlap.join(
          ', ',
        )}`,
      );
    }

    const pantry = await this.repo.findOne({
      where: { pantryId },
      relations: ['volunteers'],
    });

    if (!pantry) {
      throw new NotFoundException(`Pantry with ID ${pantryId} not found`);
    }

    const uniqueVolunteerIds = new Set([
      ...addVolunteerIds,
      ...removeVolunteerIds,
    ]);
    const users = await this.usersService.findByIds([...uniqueVolunteerIds]);

    const nonVolunteers = users.filter((user) => user.role !== Role.VOLUNTEER);
    if (nonVolunteers.length > 0) {
      throw new BadRequestException(
        `User(s) ${nonVolunteers
          .map((user) => user.id)
          .join(', ')} are not volunteers`,
      );
    }

    const volunteersToAdd = users.filter((u) => addSet.has(u.id));

    const currentVolunteers = pantry.volunteers ?? [];
    const volunteersToKeep = currentVolunteers.filter(
      (v) => !removeSet.has(v.id),
    );

    // avoid re-adding volunteers already associated with the pantry
    const existingVolunteerIds = new Set(volunteersToKeep.map((v) => v.id));
    const newVolunteers = volunteersToAdd.filter(
      (u) => !existingVolunteerIds.has(u.id),
    );

    pantry.volunteers = [...volunteersToKeep, ...newVolunteers];
    await this.repo.save(pantry);
  }

  // given pantryIds should not have duplicates
  async findByIds(pantryIds: number[]): Promise<Pantry[]> {
    pantryIds.forEach((id) => validateId(id, 'Pantry'));

    const pantries = await this.repo.findBy({ pantryId: In(pantryIds) });

    if (pantries.length !== pantryIds.length) {
      const foundIds = new Set(pantries.map((p) => p.pantryId));
      const missingIds = pantryIds.filter((id) => !foundIds.has(id));
      throw new NotFoundException(
        `Pantries not found: ${missingIds.join(', ')}`,
      );
    }

    return pantries;
  }

  async findByUserId(userId: number): Promise<Pantry> {
    validateId(userId, 'User');

    const pantry = await this.repo.findOne({
      where: { pantryUser: { id: userId } },
    });

    if (!pantry) {
      throw new NotFoundException(`Pantry for User ${userId} not found`);
    }
    return pantry;
  }

  async getStats(pantryId: number): Promise<PantryStatsDto> {
    validateId(pantryId, 'Pantry');

    const pantry = await this.repo.findOneBy({ pantryId: pantryId });

    if (!pantry) {
      throw new NotFoundException(`Pantry ${pantryId} not found`);
    }

    // Pantry has no @OneToMany to FoodRequest, so use entity-class joins with explicit column conditions
    const result = await this.repo
      .createQueryBuilder('pantry')
      .leftJoin(FoodRequest, 'fr', 'fr.pantry_id = pantry.pantry_id')
      .leftJoin(Order, 'o', 'o.request_id = fr.request_id')
      .leftJoin(Allocation, 'a', 'a.order_id = o.order_id')
      .leftJoin(DonationItem, 'di', 'di.item_id = a.item_id')
      .where('pantry.pantryId = :pantryId', { pantryId })
      .select([
        'COUNT(DISTINCT fr.request_id) AS food_requests',
        'COUNT(DISTINCT o.order_id) AS orders',
        'COALESCE(SUM(a.allocated_quantity), 0) AS total_items',
        'COALESCE(SUM(di.estimated_value * a.allocated_quantity), 0) AS total_value',
      ])
      .getRawOne();

    return {
      'Food Requests': String(result.food_requests),
      Orders: String(result.orders),
      'Items Received': String(result.total_items),
      'Value Received': `$${Number(result.total_value)}`,
    };
  }
}
