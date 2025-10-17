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
import { OrdersStatus } from '../orders/types';

@Injectable()
export class RequestsService {
  constructor(
    @InjectRepository(FoodRequest) private repo: Repository<FoodRequest>,
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

    if (!request.order) {
      throw new ConflictException('No associated order found for this request');
    }

    const order = request.order;

    if (!order.shippedBy) {
      throw new ConflictException(
        'No associated food manufacturer found for this order',
      );
    }

    request.feedback = feedback;
    request.dateReceived = deliveryDate;
    request.photos = photos;
    request.order.status = OrdersStatus.DELIVERED;

    return await this.repo.save(request);
  }
}
