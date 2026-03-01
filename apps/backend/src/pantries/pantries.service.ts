import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Pantry } from './pantries.entity';
import { User } from '../users/user.entity';
import { validateId } from '../utils/validation.utils';
import { ApplicationStatus } from '../shared/types';
import { PantryApplicationDto } from './dtos/pantry-application.dto';
import { Role } from '../users/types';
import { ApprovedPantryResponse } from './types';

@Injectable()
export class PantriesService {
  constructor(
    @InjectRepository(Pantry) private repo: Repository<Pantry>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  async findOne(pantryId: number): Promise<Pantry> {
    validateId(pantryId, 'Pantry');

    const pantry = await this.repo.findOne({
      where: { pantryId },
      relations: ['pantryUser'],
    });

    if (!pantry) {
      throw new NotFoundException(`Pantry ${pantryId} not found`);
    }
    return pantry;
  }

  async getPendingPantries(): Promise<Pantry[]> {
    return await this.repo.find({
      where: { status: ApplicationStatus.PENDING },
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

    await this.repo.update(id, { status: ApplicationStatus.APPROVED });
  }

  async deny(id: number) {
    validateId(id, 'Pantry');

    const pantry = await this.repo.findOne({ where: { pantryId: id } });
    if (!pantry) {
      throw new NotFoundException(`Pantry ${id} not found`);
    }

    await this.repo.update(id, { status: ApplicationStatus.DENIED });
  }

  async getApprovedPantriesWithVolunteers(): Promise<ApprovedPantryResponse[]> {
    const pantries = await this.repo.find({
      where: { status: ApplicationStatus.APPROVED },
      relations: ['volunteers', 'pantryUser'],
    });

    return pantries.map((pantry) => ({
      pantryId: pantry.pantryId,
      pantryName: pantry.pantryName,
      contactFirstName: pantry.pantryUser.firstName,
      contactLastName: pantry.pantryUser.lastName,
      contactEmail: pantry.pantryUser.email,
      contactPhone: pantry.pantryUser.phone,
      shipmentAddressLine1: pantry.shipmentAddressLine1,
      shipmentAddressCity: pantry.shipmentAddressCity,
      shipmentAddressState: pantry.shipmentAddressState,
      shipmentAddressCountry: pantry.shipmentAddressCountry,
      shipmentAddressZip: pantry.shipmentAddressZip,
      allergenClients: pantry.allergenClients,
      restrictions: pantry.restrictions,
      refrigeratedDonation: pantry.refrigeratedDonation,
      reserveFoodForAllergic: pantry.reserveFoodForAllergic,
      reservationExplanation: pantry.reservationExplanation,
      dedicatedAllergyFriendly: pantry.dedicatedAllergyFriendly,
      clientVisitFrequency: pantry.clientVisitFrequency,
      identifyAllergensConfidence: pantry.identifyAllergensConfidence,
      serveAllergicChildren: pantry.serveAllergicChildren,
      activities: pantry.activities,
      activitiesComments: pantry.activitiesComments,
      itemsInStock: pantry.itemsInStock,
      needMoreOptions: pantry.needMoreOptions,
      newsletterSubscription: pantry.newsletterSubscription ?? false,
      volunteers: (pantry.volunteers || []).map((volunteer) => ({
        userId: volunteer.id,
        name: `${volunteer.firstName} ${volunteer.lastName}`,
        email: volunteer.email,
        phone: volunteer.phone,
        role: volunteer.role,
      })),
    }));
  }

  async updatePantryVolunteers(
    pantryId: number,
    volunteerIds: number[],
  ): Promise<void> {
    validateId(pantryId, 'Pantry');
    volunteerIds.forEach((id) => validateId(id, 'Volunteer'));

    const pantry = await this.repo.findOne({
      where: { pantryId },
      relations: ['volunteers'],
    });

    if (!pantry) {
      throw new NotFoundException(`Pantry with ID ${pantryId} not found`);
    }

    const users = await this.userRepo.findBy({ id: In(volunteerIds) });

    if (users.length !== volunteerIds.length) {
      throw new NotFoundException('One or more users not found');
    }

    const nonVolunteers = users.filter((user) => user.role !== Role.VOLUNTEER);

    if (nonVolunteers.length > 0) {
      throw new BadRequestException(
        `Users ${nonVolunteers
          .map((user) => user.id)
          .join(', ')} are not volunteers`,
      );
    }

    pantry.volunteers = users;
    await this.repo.save(pantry);
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

  async findByUserId(userId: number): Promise<Pantry> {
    validateId(userId, 'User');

    const pantry = await this.repo.findOne({
      where: { pantryUser: { id: userId } },
    });

    if (!pantry) {
      throw new NotFoundException(`Pantry for User ${userId} not found`);
    }
    return pantry;
  }
}
