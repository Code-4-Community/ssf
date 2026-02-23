import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FoodRequest } from './request.entity';
import { validateId } from '../utils/validation.utils';
import { RequestSize } from './types';
import { Pantry } from '../pantries/pantries.entity';
import { Order } from '../orders/order.entity';
import { OrderDetailsDto } from './dtos/order-details.dto';
import { FoodManufacturer } from '../foodManufacturers/manufacturers.entity';
import {
  MatchingItemsDto,
  MatchingManufacturersDto,
} from './dtos/matching.dto';
import { FoodType } from '../donationItems/types';
import { DonationItem } from '../donationItems/donationItems.entity';

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
      items: order.allocations.map((allocation) => ({
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

    const matchingManufacturers = rows.filter((fm) => fm.matching);
    const nonMatchingManufacturers = rows.filter((fm) => !fm.matching);

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

    const matchingItems = availableItems.filter((item) =>
      request.requestedFoodTypes.includes(item.foodType),
    );
    const nonMatchingItems = availableItems.filter(
      (item) => !request.requestedFoodTypes.includes(item.foodType),
    );

    return { matchingItems, nonMatchingItems };
  }

  async create(
    pantryId: number,
    requestedSize: RequestSize,
    requestedFoodTypes: FoodType[],
    additionalInformation: string | undefined,
    dateReceived: Date | undefined,
    feedback: string | undefined,
    photos: string[] | undefined,
  ): Promise<FoodRequest> {
    validateId(pantryId, 'Pantry');

    const pantry = await this.pantryRepo.findOneBy({ pantryId });
    if (!pantry) {
      throw new NotFoundException(`Pantry ${pantryId} not found`);
    }

    const foodRequest = this.repo.create({
      pantryId,
      requestedSize,
      requestedFoodTypes,
      additionalInformation,
      dateReceived,
      feedback,
      photos,
    });

    return await this.repo.save(foodRequest);
  }

  async find(pantryId: number) {
    validateId(pantryId, 'Pantry');

    return await this.repo.find({
      where: { pantryId },
      relations: ['orders'],
    });
  }

  async updateDeliveryDetails(
    requestId: number,
    deliveryDate: Date,
    feedback: string,
    photos: string[],
  ): Promise<FoodRequest> {
    validateId(requestId, 'Request');

    const request = await this.repo.findOne({
      where: { requestId },
      relations: ['orders'],
    });

    if (!request) {
      throw new NotFoundException(`Request ${requestId} not found`);
    }

    if (!request.orders || request.orders.length == 0) {
      throw new NotFoundException(
        'No associated orders found for this request',
      );
    }

    request.feedback = feedback;
    request.dateReceived = deliveryDate;
    request.photos = photos;

    return await this.repo.save(request);
  }
}
