import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FoodRequest } from './request.entity';

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
    status: string = 'Pending',
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

    return this.repo.save(foodRequest);
  }

  find(pantryId: number) {
    if (!pantryId || pantryId < 1) {
      throw new NotFoundException('Invalid pantry ID');
    }
    return this.repo.find({ where: { pantryId } });
  }

  async updateDeliveryDetails(
    requestId: number,
    deliveryDate: Date,
    feedback: string,
    photos: string[],
  ): Promise<FoodRequest> {
    try {
      const request = await this.repo.findOne({ where: { requestId } });

      if (!request) {
        throw new Error(`Request with ID ${requestId} not found.`);
      }

      request.feedback = feedback;
      request.dateReceived = deliveryDate;
      request.photos = photos;
      request.status = 'Fulfilled';
      console.log('Request updated:', request);

      return await this.repo.save(request);
    } catch (error) {
      console.error('Error in updateDeliveryDetails:', error);
      throw error;
    }
  }
}
