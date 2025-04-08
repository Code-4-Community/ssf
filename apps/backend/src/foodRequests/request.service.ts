import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FoodRequest } from './request.entity';

@Injectable()
export class RequestsService {
  constructor(
    @InjectRepository(FoodRequest) private repo: Repository<FoodRequest>,
  ) {}

  async findOne(requestId: number) {
    if (!requestId || requestId < 1) {
      throw new NotFoundException('Invalid request ID');
    }
    return await this.repo.findOne({
      where: { requestId },
      relations: ['order'],
    });
  }

  async create(
    pantryId: number,
    requestedSize: string,
    requestedItems: string[],
    additionalInformation: string | null,
    dateReceived: Date | null,
    feedback: string | null,
    photos: string[] | null,
  ) {
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
