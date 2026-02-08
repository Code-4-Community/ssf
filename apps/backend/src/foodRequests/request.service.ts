import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FoodRequest } from './request.entity';
import { validateId } from '../utils/validation.utils';
import { RequestSize } from './types';
import { Pantry } from '../pantries/pantries.entity';
import { Order } from '../orders/order.entity';
import { OrderDetailsDto } from './dtos/order-details.dto';

@Injectable()
export class RequestsService {
  constructor(
    @InjectRepository(FoodRequest) private repo: Repository<FoodRequest>,
    @InjectRepository(Pantry) private pantryRepo: Repository<Pantry>,
    @InjectRepository(Order) private orderRepo: Repository<Order>,
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

    if (!orders) {
      throw new NotFoundException(
        'No associated orders found for this request',
      );
    }

    if (!orders.length) {
      return [];
    }

    return orders.map((order) => ({
      orderId: order.orderId,
      status: order.status,
      foodManufacturerName: order.foodManufacturer.foodManufacturerName,
      items: order.allocations.map((allocation) => ({
        name: allocation.item.itemName,
        quantity: allocation.allocatedQuantity,
        foodType: allocation.item.foodType ?? undefined,
      })),
    }));
  }

  async create(
    pantryId: number,
    requestedSize: RequestSize,
    requestedItems: string[],
    additionalInformation: string | undefined | null,
    dateReceived: Date | undefined | null,
    feedback: string | undefined | null,
    photos: string[] | undefined | null,
  ): Promise<FoodRequest> {
    validateId(pantryId, 'Pantry');

    const pantry = await this.pantryRepo.findOneBy({ pantryId });
    if (!pantry) {
      throw new NotFoundException(`Pantry ${pantryId} not found`);
    }

    const foodRequest = this.repo.create({
      pantryId,
      requestedSize,
      requestedItems,
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
      throw new NotFoundException('Invalid request ID');
    }

    if (!request.orders || request.orders.length == 0) {
      throw new NotFoundException(
        'No associated orders found for this request',
      );
    }

    const orders = request.orders;

    for (const order of orders) {
      if (!order.shippedBy) {
        throw new NotFoundException(
          'No associated food manufacturer found for an associated order',
        );
      }
    }

    request.feedback = feedback;
    request.dateReceived = deliveryDate;
    request.photos = photos;

    return await this.repo.save(request);
  }
}
