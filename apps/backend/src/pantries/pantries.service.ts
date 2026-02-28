import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Pantry } from './pantries.entity';
import { User } from '../users/user.entity';
import { validateId } from '../utils/validation.utils';
import { ApplicationStatus } from '../shared/types';
import { PantryApplicationDto } from './dtos/pantry-application.dto';
import { Role } from '../users/types';
import { PantryStats } from './types';
import { Order } from '../orders/order.entity';
import { OrdersService } from '../orders/order.service';

@Injectable()
export class PantriesService {
  constructor(
    @InjectRepository(Pantry) private repo: Repository<Pantry>,
    private ordersService: OrdersService,
  ) {}

  async getAll(): Promise<Pantry[]> {
    return this.repo.find({ relations: ['pantryUser'] });
  }

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

  // Helper to get all order stats for a pantry, with optional filtering by year
  async getStatsForPantry(
    pantry: Pantry,
    years?: number[],
  ): Promise<PantryStats> {
    const orders: Order[] = await this.ordersService.getOrdersByPantry(
      pantry.pantryId,
      years,
    );
    const stats: PantryStats = {
      pantryId: pantry.pantryId,
      totalItems: 0,
      totalOz: 0,
      totalLbs: 0,
      totalDonatedFoodValue: 0,
      totalShippingCost: 0,
      totalValue: 0,
      percentageFoodRescueItems: 0,
    };
    let totalFoodRescueItems = 0;
    orders.forEach((order) => {
      const allocations = order.allocations;
      allocations.forEach((allocation) => {
        const item = allocation.item;
        stats.totalItems += allocation.allocatedQuantity;
        stats.totalOz += (item.ozPerItem ?? 0) * allocation.allocatedQuantity;
        stats.totalDonatedFoodValue +=
          (item.estimatedValue ?? 0) * allocation.allocatedQuantity;
        if (item.foodRescue) {
          totalFoodRescueItems += allocation.allocatedQuantity;
        }
      });
      stats.totalLbs = parseFloat((stats.totalOz / 16).toFixed(2));
      stats.totalShippingCost += order.shippingCost ?? 0;
      stats.totalValue = stats.totalDonatedFoodValue + stats.totalShippingCost;
    });
    stats.percentageFoodRescueItems =
      stats.totalItems > 0
        ? parseFloat(
            ((totalFoodRescueItems / stats.totalItems) * 100).toFixed(2),
          )
        : 0;
    return stats;
  }

  // Get stats for multiple pantries, with optional filtering by pantry name, year, and pagination
  async getPantryStats(
    pantryNames?: string[],
    years?: number[],
    page = 1,
  ): Promise<PantryStats[]> {
    // Determines how many pantry stats are returned per page
    const PAGE_SIZE = 10;

    // Convert pantryNames to array if its just a single string, and handle case where it's undefined
    const nameArray = pantryNames
      ? Array.isArray(pantryNames)
        ? pantryNames
        : [pantryNames]
      : undefined;

    const nameFilter =
      nameArray && nameArray.length > 0 ? { pantryName: In(nameArray) } : {};

    const pantries = await this.repo.find({
      where: nameFilter,
      order: { pantryId: 'ASC' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    });

    // Convert years to array if its just a single number, and handle case where it's undefined
    const yearsArray = years
      ? (Array.isArray(years) ? years : [years]).map(Number)
      : undefined;

    const pantryStats: PantryStats[] = [];
    for (const pantry of pantries) {
      const stats = await this.getStatsForPantry(pantry, yearsArray);
      pantryStats.push(stats);
    }
    return pantryStats;
  }

  // Get total stats across all pantries, with optional filtering by year
  async getTotalStats(years?: number[]): Promise<PantryStats> {
    const pantries = await this.repo.find();
    const totalStats: PantryStats = {
      totalItems: 0,
      totalOz: 0,
      totalLbs: 0,
      totalDonatedFoodValue: 0,
      totalShippingCost: 0,
      totalValue: 0,
      percentageFoodRescueItems: 0,
    };
    let totalFoodRescueItems = 0;
    for (const pantry of pantries) {
      const stats = await this.getStatsForPantry(pantry, years);
      totalStats.totalItems += stats.totalItems;
      totalStats.totalOz += stats.totalOz;
      totalStats.totalLbs += stats.totalLbs;
      totalStats.totalDonatedFoodValue += stats.totalDonatedFoodValue;
      totalStats.totalShippingCost += stats.totalShippingCost;
      totalStats.totalValue += stats.totalValue;
      totalFoodRescueItems +=
        (stats.percentageFoodRescueItems / 100) * stats.totalItems;
    }
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

  async approve(id: number) {
    validateId(id, 'Pantry');

    const pantry = await this.repo.findOne({ where: { pantryId: id } });
    if (!pantry) {
      throw new NotFoundException(`Pantry ${id} not found`);
    }

    await this.repo.update(id, { status: ApplicationStatus.APPROVED });
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
