import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Pantry } from './pantries.entity';
import { User } from '../users/user.entity';
import { validateId } from '../utils/validation.utils';
import { PantryStatus } from './types';
import { PantryApplicationDto } from './dtos/pantry-application.dto';
import { Role } from '../users/types';
import { ApprovedPantryResponse } from './types';

@Injectable()
export class PantriesService {
  constructor(@InjectRepository(Pantry) private repo: Repository<Pantry>) {}

  async findOne(pantryId: number): Promise<Pantry> {
    validateId(pantryId, 'Pantry');

    const pantry = await this.repo.findOne({ where: { pantryId } });

    if (!pantry) {
      throw new NotFoundException(`Pantry ${pantryId} not found`);
    }
    return pantry;
  }

  async getPendingPantries(): Promise<Pantry[]> {
    return await this.repo.find({
      where: { status: PantryStatus.PENDING },
      relations: ['pantryUser'],
    });
  }

  async addPantry(pantryData: PantryApplicationDto) {
    const pantryContact: User = new User();
    const pantry: Pantry = new Pantry();

    // primary contact information
    pantryContact.role = Role.PANTRY;
    pantryContact.firstName = pantryData.contactFirstName;
    pantryContact.lastName = pantryData.contactLastName;
    pantryContact.email = pantryData.contactEmail;
    pantryContact.phone = pantryData.contactPhone;

    pantry.pantryUser = pantryContact;
    pantry.hasEmailContact = pantryData.hasEmailContact;
    pantry.emailContactOther = pantryData.emailContactOther;

    // secondary contact information
    pantry.secondaryContactFirstName = pantryData.secondaryContactFirstName;
    pantry.secondaryContactLastName = pantryData.secondaryContactLastName;
    pantry.secondaryContactEmail = pantryData.secondaryContactEmail;
    pantry.secondaryContactPhone = pantryData.secondaryContactPhone;

    // food shipment address information
    pantry.shipmentAddressLine1 = pantryData.shipmentAddressLine1;
    pantry.shipmentAddressLine2 = pantryData.shipmentAddressLine2;
    pantry.shipmentAddressCity = pantryData.shipmentAddressCity;
    pantry.shipmentAddressState = pantryData.shipmentAddressState;
    pantry.shipmentAddressZip = pantryData.shipmentAddressZip;
    pantry.shipmentAddressCountry = pantryData.shipmentAddressCountry;

    // mailing address information
    pantry.mailingAddressLine1 = pantryData.mailingAddressLine1;
    pantry.mailingAddressLine2 = pantryData.mailingAddressLine2;
    pantry.mailingAddressCity = pantryData.mailingAddressCity;
    pantry.mailingAddressState = pantryData.mailingAddressState;
    pantry.mailingAddressZip = pantryData.mailingAddressZip;
    pantry.mailingAddressCountry = pantryData.mailingAddressCountry;

    // pantry details information
    pantry.pantryName = pantryData.pantryName;
    pantry.allergenClients = pantryData.allergenClients;
    pantry.restrictions = pantryData.restrictions;
    pantry.refrigeratedDonation = pantryData.refrigeratedDonation;
    pantry.dedicatedAllergyFriendly = pantryData.dedicatedAllergyFriendly;
    pantry.reserveFoodForAllergic = pantryData.reserveFoodForAllergic;
    pantry.reservationExplanation = pantryData.reservationExplanation;
    pantry.clientVisitFrequency = pantryData.clientVisitFrequency;
    pantry.identifyAllergensConfidence = pantryData.identifyAllergensConfidence;
    pantry.serveAllergicChildren = pantryData.serveAllergicChildren;
    pantry.activities = pantryData.activities;
    pantry.activitiesComments = pantryData.activitiesComments;
    pantry.itemsInStock = pantryData.itemsInStock;
    pantry.needMoreOptions = pantryData.needMoreOptions;
    pantry.newsletterSubscription = pantryData.newsletterSubscription;

    // pantry contact is automatically added to User table
    await this.repo.save(pantry);
  }

  async approve(id: number) {
    validateId(id, 'Pantry');

    const pantry = await this.repo.findOne({ where: { pantryId: id } });
    if (!pantry) {
      throw new NotFoundException(`Pantry ${id} not found`);
    }

    await this.repo.update(id, { status: PantryStatus.APPROVED });
  }

  async deny(id: number) {
    validateId(id, 'Pantry');

    const pantry = await this.repo.findOne({ where: { pantryId: id } });
    if (!pantry) {
      throw new NotFoundException(`Pantry ${id} not found`);
    }

    await this.repo.update(id, { status: PantryStatus.DENIED });
  }

  async getApprovedPantriesWithVolunteers(): Promise<ApprovedPantryResponse[]> {
    const pantries = await this.repo.find({
      where: { status: PantryStatus.APPROVED },
      relations: ['pantryUser', 'volunteers'],
    });

    return pantries.map((pantry) => ({
      pantryId: pantry.pantryId,
      pantryName: pantry.pantryName,
      address: {
        line1: pantry.shipmentAddressLine1,
        line2: pantry.shipmentAddressLine2,
        city: pantry.shipmentAddressCity,
        state: pantry.shipmentAddressState,
        zip: pantry.shipmentAddressZip,
        country: pantry.shipmentAddressCountry,
      },
      contactInfo: {
        firstName: pantry.pantryUser.firstName,
        lastName: pantry.pantryUser.lastName,
        email: pantry.pantryUser.email,
        phone: pantry.pantryUser.phone,
      },
      refrigeratedDonation: pantry.refrigeratedDonation,
      allergenClients: pantry.allergenClients,
      status: pantry.status,
      dateApplied: pantry.dateApplied,
      assignedVolunteers: (pantry.volunteers || []).map((volunteer) => ({
        userId: volunteer.id,
        name: `${volunteer.firstName} ${volunteer.lastName}`,
        email: volunteer.email,
        phone: volunteer.phone,
        role: volunteer.role,
      })),
    }));
  }

  async findByIds(pantryIds: number[]): Promise<Pantry[]> {
    pantryIds.forEach((id) => validateId(id, 'Pantry'));

    const pantries = await this.repo.findBy({ pantryId: In(pantryIds) });

    if (pantries.length !== pantryIds.length) {
      const foundIds = pantries.map((p) => p.pantryId);
      const missingIds = pantryIds.filter((id) => !foundIds.includes(id));
      throw new NotFoundException(
        `Pantries not found: ${missingIds.join(', ')}`,
      );
    }

    return pantries;
  }
}
