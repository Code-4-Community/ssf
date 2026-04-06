import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FoodRequest } from './request.entity';
import { validateId } from '../utils/validation.utils';
import { FoodRequestStatus, RequestSize } from './types';
import { Pantry } from '../pantries/pantries.entity';
import { Order } from '../orders/order.entity';
import { OrderDetailsDto } from '../orders/dtos/order-details.dto';
import { OrderStatus } from '../orders/types';
import { FoodManufacturer } from '../foodManufacturers/manufacturers.entity';
import {
  MatchingItemsDto,
  MatchingManufacturersDto,
} from './dtos/matching.dto';
import { FoodType } from '../donationItems/types';
import { DonationItem } from '../donationItems/donationItems.entity';
import { EmailsService } from '../emails/email.service';
import { emailTemplates } from '../emails/emailTemplates';
import { UpdateRequestDto } from './dtos/update-request.dto';

@Injectable()
export class RequestsService {
  constructor(
    @InjectRepository(FoodRequest) private repo: Repository<FoodRequest>,
    @InjectRepository(Pantry) private pantryRepo: Repository<Pantry>,
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    @InjectRepository(FoodManufacturer)
    private foodManufacturerRepo: Repository<FoodManufacturer>,
    @InjectRepository(DonationItem)
    private donationItemRepo: Repository<DonationItem>,
    private emailsService: EmailsService,
  ) {}

  async findOne(requestId: number): Promise<FoodRequest> {
    validateId(requestId, 'Request');

    const request = await this.repo.findOne({
      where: { requestId },
      relations: ['orders'],
    });

    if (!request) {
      throw new NotFoundException(`Request ${requestId} not found`);
    }
    return request;
  }

  async getAll(): Promise<FoodRequest[]> {
    return this.repo
      .createQueryBuilder('request')
      .leftJoin('request.pantry', 'pantry')
      .select([
        'request.requestId',
        'request.requestedSize',
        'request.requestedFoodTypes',
        'request.additionalInformation',
        'request.requestedAt',
        'request.status',
        'pantry.pantryId',
        'pantry.pantryName',
      ])
      .getMany();
  }

  async getOrderDetails(requestId: number): Promise<OrderDetailsDto[]> {
    validateId(requestId, 'Request');

    const requestExists = await this.repo.findOne({
      where: { requestId },
    });

    if (!requestExists) {
      throw new NotFoundException(`Request ${requestId} not found`);
    }

    const orders = await this.orderRepo.find({
      where: { requestId },
      relations: {
        foodManufacturer: true,
        allocations: {
          item: true,
        },
      },
    });

    return orders.map((order) => ({
      orderId: order.orderId,
      status: order.status,
      foodManufacturerName: order.foodManufacturer.foodManufacturerName,
      trackingLink: order.trackingLink,
      items: order.allocations.map((allocation) => ({
        id: allocation.item.itemId,
        name: allocation.item.itemName,
        quantity: allocation.allocatedQuantity,
        foodType: allocation.item.foodType,
      })),
    }));
  }

  async getMatchingManufacturers(
    requestId: number,
  ): Promise<MatchingManufacturersDto> {
    validateId(requestId, 'Request');

    const request = await this.repo.findOne({ where: { requestId } });
    if (!request) {
      throw new NotFoundException(`Request ${requestId} not found`);
    }

    const requestedFoodTypes = request.requestedFoodTypes;

    const rows: (FoodManufacturer & { matching: boolean })[] =
      await this.foodManufacturerRepo
        .createQueryBuilder('fm')
        .addSelect(
          `EXISTS (
          SELECT 1
          FROM donations d
          JOIN donation_items di ON d.donation_id = di.donation_id
          WHERE d.food_manufacturer_id = fm.food_manufacturer_id
            AND di.food_type = ANY(:requestedFoodTypes)
            AND di.reserved_quantity < di.quantity
        )`,
          'matching',
        )
        .where(
          `EXISTS (
          SELECT 1
          FROM donations d
          JOIN donation_items di ON d.donation_id = di.donation_id
          WHERE d.food_manufacturer_id = fm.food_manufacturer_id
            AND di.reserved_quantity < di.quantity
        )`,
          { requestedFoodTypes },
        )
        .getRawAndEntities()
        .then(({ raw, entities }) =>
          entities.map((fm, i) => ({
            ...fm,
            matching: raw[i].matching as boolean,
          })),
        );

    const matchingManufacturers: typeof rows = [];
    const nonMatchingManufacturers: typeof rows = [];

    for (const fm of rows) {
      if (fm.matching) {
        matchingManufacturers.push(fm);
      } else {
        nonMatchingManufacturers.push(fm);
      }
    }

    return {
      matchingManufacturers,
      nonMatchingManufacturers,
    };
  }

  async getAvailableItems(
    requestId: number,
    foodManufacturerId: number,
  ): Promise<MatchingItemsDto> {
    validateId(requestId, 'Request');
    validateId(foodManufacturerId, 'Manufacturer');

    const request = await this.repo.findOne({ where: { requestId } });
    if (!request) {
      throw new NotFoundException(`Request ${requestId} not found`);
    }

    const manufacturer = await this.foodManufacturerRepo.findOne({
      where: { foodManufacturerId },
    });
    if (!manufacturer) {
      throw new NotFoundException(
        `Food Manufacturer ${foodManufacturerId} not found`,
      );
    }

    const availableItems = await this.donationItemRepo
      .createQueryBuilder('di')
      .select([
        'di.item_id AS "itemId"',
        'di.item_name AS "itemName"',
        'di.food_type AS "foodType"',
        '(di.quantity - di.reserved_quantity) AS "availableQuantity"',
      ])
      .innerJoin('di.donation', 'd')
      .where('d.food_manufacturer_id = :foodManufacturerId', {
        foodManufacturerId,
      })
      .andWhere('di.reserved_quantity < di.quantity')
      .getRawMany();

    const requestedFoodTypes = new Set(request.requestedFoodTypes);

    const matchingItems: typeof availableItems = [];
    const nonMatchingItems: typeof availableItems = [];

    for (const item of availableItems) {
      if (requestedFoodTypes.has(item.foodType)) {
        matchingItems.push(item);
      } else {
        nonMatchingItems.push(item);
      }
    }

    return { matchingItems, nonMatchingItems };
  }

  async create(
    pantryId: number,
    requestedSize: RequestSize,
    requestedFoodTypes: FoodType[],
    additionalInformation?: string,
  ): Promise<FoodRequest> {
    validateId(pantryId, 'Pantry');

    const pantry = await this.pantryRepo.findOne({
      where: { pantryId },
      relations: ['pantryUser', 'volunteers'],
    });
    if (!pantry) {
      throw new NotFoundException(`Pantry ${pantryId} not found`);
    }

    const foodRequest = this.repo.create({
      pantryId,
      requestedSize,
      requestedFoodTypes,
      additionalInformation,
    });

    await this.repo.save(foodRequest);

    try {
      const volunteers = pantry.volunteers || [];
      const volunteerEmails = volunteers.map((v) => v.email);

      const message = emailTemplates.pantrySubmitsFoodRequest({
        pantryName: pantry.pantryName,
      });

      await this.emailsService.sendEmails(
        volunteerEmails,
        message.subject,
        message.bodyHTML,
      );
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to send new food request notification email to volunteers',
      );
    }

    return foodRequest;
  }

  async find(pantryId: number) {
    validateId(pantryId, 'Pantry');

    return await this.repo.find({
      where: { pantryId },
      relations: ['orders', 'pantry'],
    });
  }

  async updateRequestStatus(requestId: number): Promise<void> {
    validateId(requestId, 'Request');

    const request = await this.repo.findOne({
      where: { requestId },
      relations: ['orders'],
    });

    if (!request) {
      throw new NotFoundException(`Request ${requestId} not found`);
    }

    const orders = request.orders || [];

    if (!orders.length) {
      request.status = FoodRequestStatus.ACTIVE;
      await this.repo.save(request);
      return;
    }

    const allDelivered = orders.every(
      (order) => order.status === OrderStatus.DELIVERED,
    );

    request.status = allDelivered
      ? FoodRequestStatus.CLOSED
      : FoodRequestStatus.ACTIVE;

    await this.repo.save(request);
  }

  async update(requestId: number, dto: UpdateRequestDto): Promise<FoodRequest> {
    validateId(requestId, 'Request');

    if (
      dto.requestedSize == undefined &&
      dto.requestedFoodTypes == undefined &&
      dto.additionalInformation == undefined
    ) {
      throw new BadRequestException(
        'At least one field must be provided to update request',
      );
    }

    const request = await this.repo.findOne({
      where: { requestId },
      relations: ['orders'],
    });

    if (!request) {
      throw new NotFoundException(`Request ${requestId} not found`);
    }

    if (request.status != FoodRequestStatus.ACTIVE) {
      throw new BadRequestException(
        `Request must be ${FoodRequestStatus.ACTIVE} in order to be updated`,
      );
    }

    if (request.orders && request.orders.length > 0) {
      throw new BadRequestException(
        `Request ${requestId} cannot be updated if it still has orders associated with it`,
      );
    }

    Object.assign(request, dto);

    return this.repo.save(request);
  }

  async delete(requestId: number) {
    validateId(requestId, 'Request');

    const request = await this.repo.findOne({
      where: { requestId },
      relations: ['orders'],
    });

    if (!request) {
      throw new NotFoundException(`Request ${requestId} not found`);
    }

    if (request.status != FoodRequestStatus.ACTIVE) {
      throw new BadRequestException(
        `Request must be ${FoodRequestStatus.ACTIVE} in order to be deleted`,
      );
    }

    if (request.orders && request.orders.length > 0) {
      throw new BadRequestException(
        `Request ${requestId} cannot be deleted if it still has orders associated with it`,
      );
    }

    await this.repo.remove(request);
  }
}
