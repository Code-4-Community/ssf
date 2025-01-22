import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Delivery } from './delivery.entity';
import { DeliveryDto } from './DeliveryDTO';

@Injectable()
export class DeliveryService {
  constructor(@InjectRepository(Delivery) private repo: Repository<Delivery>) {}

  async confirmDelivery(data: DeliveryDto) {
    const delivery = this.repo.create({ ...data });
    return this.repo.save(delivery);
  }
}
