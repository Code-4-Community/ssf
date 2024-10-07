import { Injectable } from '@nestjs/common';
import { CreateDonationDto } from './dto/create-donation.dto';
import { UpdateDonationDto } from './dto/update-donation.dto';
import { FilterDonationsDto } from './dto/filter-donations.dto';
import { Donation } from './donation.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';

@Injectable()
export class DonationsService {
  constructor(@InjectRepository(Donation) private repo: Repository<Donation>) {}

  create(createDonationDto: CreateDonationDto) {
    return 'This action adds a new donation';
  }

  findAll() {
    return `This action returns all donations`;
  }

  findOne(id: number) {
    return `This action returns a #${id} donation`;
  }

  update(id: number, updateDonationDto: UpdateDonationDto) {
    return `This action updates a #${id} donation`;
  }

  remove(id: number) {
    return `This action removes a #${id} donation`;
  }

  filter(filterDonationsDto: FilterDonationsDto) {
    return this.repo.find({
      where: {
        pantry_id: In(filterDonationsDto.pantry_ids),
        status: filterDonationsDto.status,
        due_date: Between(
          filterDonationsDto.due_date_start,
          filterDonationsDto.due_date_end,
        ),
      },
    });
  }
}
