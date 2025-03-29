import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pantry } from './pantries.entity';
import { User } from '../users/user.entity';
import { PantryApplicationDto } from './dtos/pantry-application.dto';
import { Role } from '../users/types';

@Injectable()
export class PantriesService {
  constructor(@InjectRepository(Pantry) private repo: Repository<Pantry>) {}

  async findOne(pantryId: number) {
    if (!pantryId || pantryId < 1) {
      throw new NotFoundException('Invalid pantry ID');
    }
    return await this.repo.findOne({ where: { pantryId } });
  }

  async getPendingPantries() {
    return await this.repo.find({ where: { status: 'pending' } });
  }

  async addPantry(pantryData: PantryApplicationDto) {
    const pantryContact: User = new User();
    const pantry: Pantry = new Pantry();

    pantryContact.role = Role.PANTRY;
    pantryContact.firstName = pantryData.contactFirstName;
    pantryContact.lastName = pantryData.contactLastName;
    pantryContact.email = pantryData.contactEmail;
    pantryContact.phone = pantryData.contactPhone;

    pantry.pantryRepresentative = pantryContact;

    pantry.pantryName = pantryData.pantryName;
    pantry.addressLine1 = pantryData.addressLine1;
    pantry.addressLine2 = pantryData.addressLine2;
    pantry.addressCity = pantryData.addressCity;
    pantry.addressState = pantryData.addressState;
    pantry.addressZip = pantryData.addressZip;
    pantry.addressCountry = pantryData.addressCountry;
    pantry.allergenClients = pantryData.allergenClients;
    pantry.restrictions = pantryData.restrictions;
    pantry.refrigeratedDonation = pantryData.refrigeratedDonation;
    pantry.reserveFoodForAllergic = pantryData.reserveFoodForAllergic;
    pantry.reservationExplanation = pantryData.reservationExplanation;
    pantry.dedicatedAllergyFriendly = pantryData.dedicatedAllergyFriendly;
    pantry.clientVisitFrequency = pantryData.clientVisitFrequency;
    pantry.identifyAllergensConfidence = pantryData.identifyAllergensConfidence;
    pantry.serveAllergicChildren = pantryData.serveAllergicChildren;
    pantry.activities = pantryData.activities;
    pantry.activitiesComments = pantryData.activitiesComments;
    pantry.itemsInStock = pantryData.itemsInStock;
    pantry.needMoreOptions = pantryData.needMoreOptions;
    pantry.newsletterSubscription =
      pantryData?.newsletterSubscription === 'Yes';

    // pantry contact is automatically added to User table
    await this.repo.save(pantry);
  }

  async approve(id: number) {
    await this.repo
      .createQueryBuilder()
      .update(Pantry)
      .set({ status: 'approved' })
      .where('pantry_id = :pantryId', { pantryId: id })
      .execute();
  }

  async deny(id: number) {
    await this.repo
      .createQueryBuilder()
      .update(Pantry)
      .set({ status: 'denied' })
      .where('pantry_id = :pantryId', { pantryId: id })
      .execute();
  }

  async findSSFRep(pantryId: number): Promise<User | null> {
    const pantry = await this.repo.findOne({
      where: { pantryId },
      relations: ['ssfRepresentative'],
    });

    if (!pantry) {
      return null;
    } else {
      return pantry.ssfRepresentative;
    }
  }
}
