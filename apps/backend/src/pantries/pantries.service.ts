import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Pantry } from './pantries.entity';
import { Order } from '../orders/order.entity';
import { User } from '../users/users.entity';
import { validateId } from '../utils/validation.utils';
import { ApplicationStatus } from '../shared/types';
import { PantryApplicationDto } from './dtos/pantry-application.dto';
import { Role } from '../users/types';
import { PantryStats, TotalStats } from './types';
import { userSchemaDto } from '../users/dtos/userSchema.dto';
import { UsersService } from '../users/users.service';
import { UpdatePantryApplicationDto } from './dtos/update-pantry-application.dto';

@Injectable()
export class PantriesService {
  constructor(
    @InjectRepository(Pantry) private repo: Repository<Pantry>,
    @InjectRepository(Order) private orderRepo: Repository<Order>,

    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
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

  private readonly EMPTY_STATS: Omit<PantryStats, 'pantryId'> = {
    totalItems: 0,
    totalOz: 0,
    totalLbs: 0,
    totalDonatedFoodValue: 0,
    totalShippingCost: 0,
    totalValue: 0,
    percentageFoodRescueItems: 0,
  };

  private async aggregateStats(
    pantryIds?: number[],
    years?: number[],
  ): Promise<PantryStats[]> {
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
      .groupBy('request.pantryId');

    if (pantryIds?.length) {
      itemsQb.andWhere('request.pantryId IN (:...pantryIds)', { pantryIds });
    }
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
      .groupBy('request.pantryId');

    if (pantryIds?.length) {
      shippingQb.andWhere('request.pantryId IN (:...pantryIds)', { pantryIds });
    }
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
      } satisfies PantryStats;
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

    const nameArray = pantryNames
      ? Array.isArray(pantryNames)
        ? pantryNames
        : [pantryNames]
      : undefined;

    // If names were provided, validate ALL of them before paginating
    if (nameArray?.length) {
      const allMatched = await this.repo.find({
        select: ['pantryId', 'pantryName'],
        where: { pantryName: In(nameArray) },
        order: { pantryId: 'ASC' },
      });

      const missingNames = nameArray.filter(
        (name) => !allMatched.some((p) => p.pantryName === name),
      );
      if (missingNames.length > 0) {
        throw new NotFoundException(
          `Pantries not found: ${missingNames.join(', ')}`,
        );
      }

      // Paginate the validated results in-memory
      const paginated = allMatched.slice(
        (page - 1) * PAGE_SIZE,
        page * PAGE_SIZE,
      );
      if (paginated.length === 0) return [];

      const pantryIds = paginated.map((p) => p.pantryId);
      const yearsArray = years
        ? (Array.isArray(years) ? years : [years]).map(Number)
        : undefined;

      const stats = await this.aggregateStats(pantryIds, yearsArray);
      const statsMap = new Map(stats.map((s) => [s.pantryId, s]));
      return pantryIds.map(
        (id) => statsMap.get(id) ?? { pantryId: id, ...this.EMPTY_STATS },
      );
    }

    // No names provided — paginate from the full table
    const pantries = await this.repo.find({
      select: ['pantryId', 'pantryName'],
      order: { pantryId: 'ASC' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    });

    if (pantries.length === 0) return [];

    const pantryIds = pantries.map((p) => p.pantryId);
    const yearsArray = years
      ? (Array.isArray(years) ? years : [years]).map(Number)
      : undefined;

    const stats = await this.aggregateStats(pantryIds, yearsArray);
    const statsMap = new Map(stats.map((s) => [s.pantryId, s]));
    return pantryIds.map(
      (id) => statsMap.get(id) ?? { pantryId: id, ...this.EMPTY_STATS },
    );
  }

  async getTotalStats(years?: number[]): Promise<TotalStats> {
    const yearsArray = years
      ? (Array.isArray(years) ? years : [years]).map(Number)
      : undefined;

    const stats = await this.aggregateStats(undefined, yearsArray);

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
  }

  async updatePantryApplication(
    pantryId: number,
    pantryData: UpdatePantryApplicationDto,
  ) {
    validateId(pantryId, 'Pantry');

    const pantry = await this.repo.findOne({
      where: { pantryId: pantryId },
    });

    if (!pantry) {
      throw new NotFoundException(`Pantry ${pantryId} not found`);
    }

    Object.assign(pantry, pantryData);

    await this.repo.save(pantry);
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

    const createUserDto: userSchemaDto = {
      ...pantry.pantryUser,
      role: Role.PANTRY,
    };

    const newPantryUser = await this.usersService.create(createUserDto);

    await this.repo.update(id, {
      status: ApplicationStatus.APPROVED,
      pantryUser: newPantryUser,
    });
  }

  async deny(id: number) {
    validateId(id, 'Pantry');

    const pantry = await this.repo.findOne({ where: { pantryId: id } });
    if (!pantry) {
      throw new NotFoundException(`Pantry ${id} not found`);
    }

    await this.repo.update(id, { status: ApplicationStatus.DENIED });
  }

  async findByIds(pantryIds: number[]): Promise<Pantry[]> {
    pantryIds.forEach((id) => validateId(id, 'Pantry'));

    const pantries = await this.repo.findBy({ pantryId: In(pantryIds) });

    if (pantries.length !== pantryIds.length) {
      const foundIds = pantries.map((p) => p.pantryId);
      const missingIds = pantryIds.filter((id) => !foundIds.includes(id));
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
}
