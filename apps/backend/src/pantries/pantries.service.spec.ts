import { Test, TestingModule } from '@nestjs/testing';
import { PantriesService } from './pantries.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Pantry } from './pantries.entity';
import { Repository } from 'typeorm';
import { NotFoundException, Res } from '@nestjs/common';
import { Role } from '../users/types';
import { mock } from 'jest-mock-extended';
import { PantryApplicationDto } from './dtos/pantry-application.dto';
import {
  ClientVisitFrequency,
  PantryStatus,
  RefrigeratedDonation,
  ServeAllergicChildren,
} from './types';
import { ReserveFoodForAllergic } from './types';
import { Activity } from './types';
import { AllergensConfidence } from './types';
import { StatusType } from '@aws-sdk/client-cognito-identity-provider';

const mockRepository = mock<Repository<Pantry>>();

describe('PantriesService', () => {
  let service: PantriesService;

  const mockUser = {
    id: 1,
    role: Role.VOLUNTEER,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '123-456-7890',
  };

  // Mock Pantry
  const mockPendingPantry = {
    pantryId: 1,
    pantryName: 'Test Pantry',
    status: PantryStatus.PENDING,
  } as Pantry;

  // Mock Pantry Application
  const mockPantryApplication = {
    contactFirstName: 'Jane',
    contactLastName: 'Smith',
    contactEmail: 'jane.smith@example.com',
    contactPhone: '(508) 222-2222',
    hasEmailContact: true,
    emailContactOther: null,
    secondaryContactFirstName: 'John',
    secondaryContactLastName: 'Doe',
    secondaryContactEmail: 'john.doe@example.com',
    secondaryContactPhone: '(508) 333-3333',
    shipmentAddressLine1: '456 New St',
    shipmentAddressLine2: 'Suite 200',
    shipmentAddressCity: 'Cambridge',
    shipmentAddressState: 'MA',
    shipmentAddressZip: '02139',
    shipmentAddressCountry: 'USA',
    acceptFoodDeliveries: true,
    deliveryWindowInstructions: 'Please deliver between 9am-5pm',
    mailingAddressLine1: '456 New St',
    mailingAddressLine2: 'Suite 200',
    mailingAddressCity: 'Cambridge',
    mailingAddressState: 'MA',
    mailingAddressZip: '02139',
    mailingAddressCountry: 'USA',
    pantryName: 'New Community Pantry',
    allergenClients: '10 to 20',
    restrictions: ['Peanut allergy', 'Gluten'],
    refrigeratedDonation: RefrigeratedDonation.YES,
    dedicatedAllergyFriendly: true,
    reserveFoodForAllergic: ReserveFoodForAllergic.SOME,
    reservationExplanation: 'We have a dedicated allergen-free section',
    clientVisitFrequency: ClientVisitFrequency.DAILY,
    identifyAllergensConfidence: AllergensConfidence.VERY_CONFIDENT,
    serveAllergicChildren: ServeAllergicChildren.YES_MANY,
    activities: [Activity.CREATE_LABELED_SHELF, Activity.COLLECT_FEEDBACK],
    activitiesComments: 'We provide nutritional counseling',
    itemsInStock: 'Canned goods, pasta',
    needMoreOptions: 'More fresh produce',
    newsletterSubscription: true,
  } as PantryApplicationDto;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PantriesService,
        {
          provide: getRepositoryToken(Pantry),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<PantriesService>(PantriesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Find pantry by ID
  describe('findOne', () => {
    it('should return a pantry by id', async () => {
      mockRepository.findOne.mockResolvedValueOnce(mockPendingPantry);

      const result = await service.findOne(1);

      expect(result).toBe(mockPendingPantry);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { pantryId: 1 },
      });
    });

    it('should throw NotFoundException if pantry not found', async () => {
      mockRepository.findOne.mockResolvedValueOnce(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(999)).rejects.toThrow(
        'Pantry 999 not found',
      );
    });
  });

  // Get pantries with pending status
  describe('getPendingPantries', () => {
    it('should return only pending pantries', async () => {
      const pendingPantries = [
        mockPendingPantry,
        { ...mockPendingPantry, pantryId: 3 },
      ];
      mockRepository.find.mockResolvedValueOnce(pendingPantries);

      const result = await service.getPendingPantries();

      expect(result).toEqual(pendingPantries);
      expect(result).toHaveLength(2);
      expect(result.every((pantry) => pantry.status === 'pending')).toBe(true);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { status: 'pending' },
      });
    });

    it('should not return approved pantries', async () => {
      mockRepository.find.mockResolvedValueOnce([mockPendingPantry]);

      const result = await service.getPendingPantries();

      expect(result).not.toContainEqual(
        expect.objectContaining({ status: 'approved' }),
      );
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { status: 'pending' },
      });
    });

    it('should return an empty array if no pending pantries', async () => {
      mockRepository.find.mockResolvedValueOnce([]);

      const result = await service.getPendingPantries();

      expect(result).toEqual([]);
    });
  });

  // Approve pantry by ID (status = approved)
  describe('approve', () => {
    it('should approve a pantry', async () => {
      mockRepository.findOne.mockResolvedValueOnce(mockPendingPantry);
      mockRepository.update.mockResolvedValueOnce(undefined);

      await service.approve(1);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { pantryId: 1 },
      });
      expect(mockRepository.update).toHaveBeenCalledWith(1, {
        status: 'approved',
      });
    });

    it('should throw NotFoundException if pantry not found', async () => {
      mockRepository.findOne.mockResolvedValueOnce(null);

      await expect(service.approve(999)).rejects.toThrow(NotFoundException);
      await expect(service.approve(999)).rejects.toThrow(
        'Pantry 999 not found',
      );
      expect(mockRepository.update).not.toHaveBeenCalled();
    });
  });

  // Deny pantry by ID (status = denied)
  describe('deny', () => {
    it('should deny a pantry', async () => {
      mockRepository.findOne.mockResolvedValueOnce(mockPendingPantry);
      mockRepository.update.mockResolvedValueOnce(undefined);

      await service.deny(1);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { pantryId: 1 },
      });
      expect(mockRepository.update).toHaveBeenCalledWith(1, {
        status: 'denied',
      });
    });

    it('should throw NotFoundException if pantry not found', async () => {
      mockRepository.findOne.mockResolvedValueOnce(null);

      await expect(service.deny(999)).rejects.toThrow(NotFoundException);
      await expect(service.deny(999)).rejects.toThrow('Pantry 999 not found');
      expect(mockRepository.update).not.toHaveBeenCalled();
    });
  });

  // Add pantry
  describe('addPantry', () => {
    it('should add a new pantry application', async () => {
      mockRepository.save.mockResolvedValueOnce(mockPendingPantry);

      await service.addPantry(mockPantryApplication);

      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          pantryName: mockPantryApplication.pantryName,
          shipmentAddressLine1: mockPantryApplication.shipmentAddressLine1,
          shipmentAddressLine2: mockPantryApplication.shipmentAddressLine2,
          shipmentAddressCity: mockPantryApplication.shipmentAddressCity,
          shipmentAddressState: mockPantryApplication.shipmentAddressState,
          shipmentAddressZip: mockPantryApplication.shipmentAddressZip,
          shipmentAddressCountry: mockPantryApplication.shipmentAddressCountry,
          mailingAddressLine1: mockPantryApplication.mailingAddressLine1,
          mailingAddressLine2: mockPantryApplication.mailingAddressLine2,
          mailingAddressCity: mockPantryApplication.mailingAddressCity,
          mailingAddressState: mockPantryApplication.mailingAddressState,
          mailingAddressZip: mockPantryApplication.mailingAddressZip,
          mailingAddressCountry: mockPantryApplication.mailingAddressCountry,
          allergenClients: mockPantryApplication.allergenClients,
          restrictions: mockPantryApplication.restrictions,
          refrigeratedDonation: mockPantryApplication.refrigeratedDonation,
          reserveFoodForAllergic: mockPantryApplication.reserveFoodForAllergic,
          reservationExplanation: mockPantryApplication.reservationExplanation,
          dedicatedAllergyFriendly:
            mockPantryApplication.dedicatedAllergyFriendly,
          clientVisitFrequency: mockPantryApplication.clientVisitFrequency,
          identifyAllergensConfidence:
            mockPantryApplication.identifyAllergensConfidence,
          serveAllergicChildren: mockPantryApplication.serveAllergicChildren,
          activities: mockPantryApplication.activities,
          activitiesComments: mockPantryApplication.activitiesComments,
          itemsInStock: mockPantryApplication.itemsInStock,
          needMoreOptions: mockPantryApplication.needMoreOptions,
          newsletterSubscription: true,
        }),
      );
    });

    it('should create pantry representative from contact info', async () => {
      mockRepository.save.mockResolvedValueOnce(mockPendingPantry);

      await service.addPantry(mockPantryApplication);

      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          pantryRepresentative: expect.objectContaining({
            firstName: mockPantryApplication.contactFirstName,
            lastName: mockPantryApplication.contactLastName,
            email: mockPantryApplication.contactEmail,
            phone: mockPantryApplication.contactPhone,
            role: 'pantry',
          }),
        }),
      );
    });

    it('should throw error if save fails', async () => {
      mockRepository.save.mockRejectedValueOnce(new Error('Database error'));

      await expect(service.addPantry(mockPantryApplication)).rejects.toThrow(
        'Database error',
      );
      expect(mockRepository.save).toHaveBeenCalled();
    });
  });
});
