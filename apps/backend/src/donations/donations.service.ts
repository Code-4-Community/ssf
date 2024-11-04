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

  async filter(filterDonationsDto: FilterDonationsDto) {
    let query = this.repo.createQueryBuilder('donation');
    if (filterDonationsDto.pantry_ids != null) {
      query = query.where('donation.pantry_id IN (:...ids)', {
        ids: filterDonationsDto.pantry_ids,
      });
    }
    if (filterDonationsDto.status != null) {
      query = query.andWhere('donation.status = :status', {
        status: filterDonationsDto.status,
      });
    }
    if (filterDonationsDto.due_date_start != null) {
      query = query.andWhere('donation.due_date >= :start', {
        start: filterDonationsDto.due_date_start,
      });
    }
    if (filterDonationsDto.due_date_end != null) {
      query = query.andWhere('donation.due_date <= :end', {
        end: filterDonationsDto.due_date_end,
      });
    }
    const donations = await query.getMany();
    return donations;
  }
}
