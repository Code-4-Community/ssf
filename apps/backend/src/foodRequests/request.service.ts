import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FoodRequest } from './request.entity';

@Injectable()
export class RequestsService {
  constructor(
    @InjectRepository(FoodRequest) private repo: Repository<FoodRequest>,
  ) {}

  async findOne(requestId: number): Promise<FoodRequest> {
    if (!requestId || requestId < 1) {
      throw new NotFoundException('Invalid request ID');
    }
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
    requestedSize: string,
    requestedItems: string[],
    additionalInformation: string | undefined,
    status: string,
    fulfilledBy: number | undefined,
    dateReceived: Date | undefined,
    feedback: string | undefined,
    photos: string[] | undefined,
  ): Promise<FoodRequest> {
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
    const request = await this.repo.findOne({ where: { requestId } });

    if (!request) {
      throw new NotFoundException('Invalid request ID');
    }

    request.feedback = feedback;
    request.dateReceived = deliveryDate;
    request.photos = photos;

    return await this.repo.save(request);
  }
}
