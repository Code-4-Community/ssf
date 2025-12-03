import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pantry } from './pantries.entity';
import { User } from '../users/user.entity';
import { validateId } from '../utils/validation.utils';
import { PantryApplicationDto } from './dtos/pantry-application.dto';
import { Role } from '../users/types';
import { Assignments } from '../volunteerAssignments/volunteerAssignments.entity';
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
      where: { status: 'pending' },
      relations: ['pantryUser'],
    });
  }

  async addPantry(pantryData: PantryApplicationDto) {
    const pantryContact: User = new User();
    const pantry: Pantry = new Pantry();

    pantryContact.role = Role.PANTRY;
    pantryContact.firstName = pantryData.contactFirstName;
    pantryContact.lastName = pantryData.contactLastName;
    pantryContact.email = pantryData.contactEmail;
    pantryContact.phone = pantryData.contactPhone;

    pantry.pantryUser = pantryContact;

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
    validateId(id, 'Pantry');

    const pantry = await this.repo.findOne({ where: { pantryId: id } });
    if (!pantry) {
      throw new NotFoundException(`Pantry ${id} not found`);
    }

    await this.repo.update(id, { status: 'approved' });
  }

  async deny(id: number) {
    validateId(id, 'Pantry');

    const pantry = await this.repo.findOne({ where: { pantryId: id } });
    if (!pantry) {
      throw new NotFoundException(`Pantry ${id} not found`);
    }

    await this.repo.update(id, { status: 'denied' });
  }

  async getApprovedPantriesWithVolunteers(): Promise<ApprovedPantryResponse[]> {
    const [pantries, assignments] = await Promise.all([
      this.repo.find({
        where: { status: 'approved' },
        relations: ['pantryUser'],
      }),
      this.repo.manager.find(Assignments, {
        relations: ['volunteer', 'pantry'],
      }),
    ]);

    const assignmentsByPantry = assignments.reduce((acc, assignment) => {
      const pantryId = assignment.pantry?.pantryId;
      if (pantryId) {
        if (!acc[pantryId]) acc[pantryId] = [];
        acc[pantryId].push(assignment);
      }
      return acc;
    }, {} as Record<number, Assignments[]>);

    return pantries.map((pantry) => ({
      pantryId: pantry.pantryId,
      pantryName: pantry.pantryName,
      address: {
        line1: pantry.addressLine1,
        line2: pantry.addressLine2,
        city: pantry.addressCity,
        state: pantry.addressState,
        zip: pantry.addressZip,
        country: pantry.addressCountry,
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
      assignedVolunteers: (assignmentsByPantry[pantry.pantryId] || []).map(
        (assignment) => ({
          assignmentId: assignment.assignmentId,
          userId: assignment.volunteer.id,
          name: `${assignment.volunteer.firstName} ${assignment.volunteer.lastName}`,
          email: assignment.volunteer.email,
          phone: assignment.volunteer.phone,
          role: assignment.volunteer.role,
        }),
      ),
    }));
  }

  async updatePantryVolunteers(
    pantryId: number,
    volunteerIds: number[],
  ): Promise<void> {
    validateId(pantryId, 'Pantry');

    await this.findOne(pantryId);

    await this.repo.manager.delete(Assignments, { pantry: { pantryId } });

    if (volunteerIds.length > 0) {
      const newAssignments = volunteerIds.map((volunteerId) =>
        this.repo.manager.create(Assignments, {
          volunteer: { id: volunteerId },
          pantry: { pantryId },
        }),
      );

      await this.repo.manager.save(Assignments, newAssignments);
    }
  }
}
