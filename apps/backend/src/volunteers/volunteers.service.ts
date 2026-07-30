import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/users.entity';
import { Role } from '../users/types';
import { validateId } from '../utils/validation.utils';
import { Pantry } from '../pantries/pantries.entity';
import { UsersService } from '../users/users.service';
import { Assignments, VolunteerOrder } from './types';
import { RequestsService } from '../foodRequests/request.service';
import { OrdersService } from '../orders/order.service';
import { FoodRequestSummaryDto } from '../foodRequests/dtos/food-request-summary.dto';
import { Order } from '../orders/order.entity';
import { FoodRequest } from '../foodRequests/request.entity';
import { Allocation } from '../allocations/allocations.entity';
import { DonationItem } from '../donationItems/donationItems.entity';
import { Donation } from '../donations/donations.entity';
import { VolunteerStatsDto } from './dtos/volunteer-stats.dto';

@Injectable()
export class VolunteersService {
  constructor(
    @InjectRepository(User)
    private repo: Repository<User>,
    @InjectRepository(Order)
    private orderRepo: Repository<Order>,
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
    @Inject(forwardRef(() => RequestsService))
    private requestsService: RequestsService,
    @Inject(forwardRef(() => OrdersService))
    private ordersService: OrdersService,
  ) {}

  async findOne(id: number): Promise<User> {
    validateId(id, 'Volunteer');

    const volunteer = await this.repo.findOne({
      where: { id: id },
      relations: ['pantries'],
    });

    if (!volunteer) {
      throw new NotFoundException(`Volunteer ${id} not found`);
    }
    if (volunteer.role !== Role.VOLUNTEER) {
      throw new NotFoundException(`User ${id} is not a volunteer`);
    }
    return volunteer;
  }

  async getVolunteersAndPantryAssignments(
    excludeUserId?: number,
  ): Promise<Assignments[]> {
    const volunteers = await this.usersService.findUsersByRoles([
      Role.VOLUNTEER,
      Role.ADMIN,
    ]);

    return volunteers
      .filter((v) => v.id !== excludeUserId)
      .map((v) => {
        const { pantries, ...volunteerWithoutPantries } = v;
        return {
          ...volunteerWithoutPantries,
          pantryIds: pantries?.map((p) => p.pantryId) || [],
        };
      });
  }

  async getVolunteerPantries(volunteerId: number): Promise<Pantry[]> {
    validateId(volunteerId, 'Volunteer');
    const volunteer = await this.findOne(volunteerId);
    return volunteer.pantries || [];
  }

  async getRecentOrders(volunteerId: number): Promise<VolunteerOrder[]> {
    validateId(volunteerId, 'Volunteer');
    const volunteer = await this.findOne(volunteerId);
    if (!volunteer) {
      throw new NotFoundException(`Volunteer ${volunteerId} not found`);
    }
    return this.ordersService.getRecentOrdersByAssignee(volunteerId);
  }

  async findRequestsByVolunteer(
    volunteerId: number,
  ): Promise<FoodRequestSummaryDto[]> {
    validateId(volunteerId, 'Volunteer');

    const pantries = await this.getVolunteerPantries(volunteerId);
    const pantryIds = pantries.map((p) => p.pantryId);

    const requestArrays = await Promise.all(
      pantryIds.map((id) => this.requestsService.findAllForPantry(id)),
    );

    return requestArrays.flat().map((r) => ({
      requestId: r.requestId,
      requestedSize: r.requestedSize,
      requestedFoodTypes: r.requestedFoodTypes,
      location: r.location,
      additionalInformation: r.additionalInformation,
      feedbackOnPriorDonation: r.feedbackOnPriorDonation,
      requestedAt: r.requestedAt,
      status: r.status,
      pantry: {
        pantryId: r.pantry.pantryId,
        pantryName: r.pantry.pantryName,
      },
    }));
  }

  async getVolunteerDashboardStats(
    volunteerId: number,
  ): Promise<VolunteerStatsDto> {
    await this.findOne(volunteerId);

    // Food requests for pantries the volunteer is assigned to
    const foodRequestsResult = await this.repo
      .createQueryBuilder('volunteer')
      .leftJoin('volunteer.pantries', 'pantry')
      .leftJoin(FoodRequest, 'fr', 'fr.pantry_id = pantry.pantry_id')
      .where('volunteer.id = :volunteerId', { volunteerId })
      .select('COUNT(DISTINCT fr.request_id)', 'food_requests')
      .getRawOne();

    // Orders assigned to the volunteer
    const ordersResult = await this.orderRepo
      .createQueryBuilder('order')
      .where('order.assigneeId = :volunteerId', { volunteerId })
      .select('COUNT(DISTINCT order.order_id)', 'orders')
      .getRawOne();

    // Unique donations behind the donation items allocated to the volunteer's
    // orders
    const donationsResult = await this.orderRepo
      .createQueryBuilder('order')
      .leftJoin(Allocation, 'a', 'a.order_id = order.order_id')
      .leftJoin(DonationItem, 'di', 'di.item_id = a.item_id')
      .leftJoin(Donation, 'd', 'd.donation_id = di.donation_id')
      .where('order.assigneeId = :volunteerId', { volunteerId })
      .select('COUNT(DISTINCT di.donation_id)', 'donations')
      .getRawOne();

    return {
      'Food Requests': String(foodRequestsResult.food_requests),
      Orders: String(ordersResult.orders),
      Donations: String(donationsResult.donations),
    };
  }
}
