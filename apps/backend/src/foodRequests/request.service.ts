import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FoodRequest } from './request.entity';
import { validateId } from '../utils/validation.utils';
import { RequestSize } from './types';
import { OrderStatus } from '../orders/types';
import { Pantry } from '../pantries/pantries.entity';

@Injectable()
export class RequestsService {
  constructor(
    @InjectRepository(FoodRequest) private repo: Repository<FoodRequest>,
    @InjectRepository(Pantry) private pantryRepo: Repository<Pantry>,
  ) {}

  async findOne(requestId: number): Promise<FoodRequest> {
    validateId(requestId, 'Request');

    const request = await this.repo.findOne({
      where: { requestId },
      relations: ['order'],
    });

    if (!request) {
      throw new NotFoundException(`Request ${requestId} not found`);
    }
    return request;
  }

  async create(
    pantryId: number,
    requestedSize: RequestSize,
    requestedItems: string[],
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
      relations: ['order'],
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
      relations: ['order'],
    });

    if (!request) {
      throw new NotFoundException('Invalid request ID');
    }

    if (!request.orders || request.orders.length == 0) {
      throw new ConflictException(
        'No associated orders found for this request',
      );
    }

    const orders = request.orders;

    for (const order of orders) {
      if (!order.shippedBy) {
        throw new ConflictException(
          'No associated food manufacturer found for an associated order',
        );
      }
    }

    request.feedback = feedback;
    request.dateReceived = deliveryDate;
    request.photos = photos;
    request.orders.forEach((order) => {
      order.status = OrderStatus.DELIVERED;
    });

    return await this.repo.save(request);
  }
}
