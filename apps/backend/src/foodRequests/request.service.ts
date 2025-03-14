import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FoodRequest } from './request.entity';
import { Order } from '../orders/order.entity';

@Injectable()
export class RequestsService {
  constructor(
    @InjectRepository(FoodRequest) private repo: Repository<FoodRequest>,
  ) {}

  async create(
    pantryId: number,
    requestedSize: string,
    requestedItems: string[],
    additionalInformation: string | null,
    status: string = 'pending',
    fulfilledBy: number | null,
    dateReceived: Date | null,
    feedback: string | null,
    photos: string[] | null,
  ) {
    const foodRequest = this.repo.create({
      pantryId,
      requestedSize,
      requestedItems,
      additionalInformation,
      status,
      fulfilledBy,
      dateReceived,
      feedback,
      photos,
    });

    return await this.repo.save(foodRequest);
  }

  async find(pantryId: number) {
    if (!pantryId || pantryId < 1) {
      throw new NotFoundException('Invalid pantry ID');
    }

    const foodRequests = await this.repo.find({
      where: { pantryId },
      relations: ['order'],
    });

    const foodRequestsWithOrderId = foodRequests.map((request) => ({
      ...request,
      orderId: request.order ? request.order.orderId : null,
      order: undefined,
    }));

    return foodRequestsWithOrderId;
  }

  async updateDeliveryDetails(
    requestId: number,
    deliveryDate: Date,
    feedback: string,
    photos: string[],
  ): Promise<FoodRequest> {
    const request = await this.repo.findOne({
      where: { requestId },
      relations: ['order'],
    });

    if (!request) {
      throw new NotFoundException('Invalid request ID');
    }

    if (!request.order) {
      throw new NotFoundException('No associated order found for this request');
    }

    const order = await this.repo.manager.findOne(Order, {
      where: { orderId: request.order.orderId },
      relations: ['shippedBy'],
    });

    if (!order || !order.shippedBy) {
      throw new NotFoundException(
        'No associated food manufacturer found for this order',
      );
    }

    request.feedback = feedback;
    request.dateReceived = deliveryDate;
    request.photos = photos;
    request.status = 'fulfilled';
    request.fulfilledBy = order.shippedBy.foodManufacturerId;

    return await this.repo.save(request);
  }
}
