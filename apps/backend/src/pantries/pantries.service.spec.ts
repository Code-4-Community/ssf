import { Test, TestingModule } from '@nestjs/testing';
import { PantriesService } from './pantries.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Pantry } from './pantries.entity';
import { Repository, In } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { mock } from 'jest-mock-extended';
import { PantryApplicationDto } from './dtos/pantry-application.dto';
import {
  ClientVisitFrequency,
  RefrigeratedDonation,
  ServeAllergicChildren,
  ReserveFoodForAllergic,
  Activity,
  AllergensConfidence,
} from './types';
import { ApplicationStatus } from '../shared/types';
import { User } from '../users/user.entity';
import { Role } from '../users/types';

const mockRepository = mock<Repository<Pantry>>();
const mockUserRepository = mock<Repository<User>>();

describe('PantriesService', () => {
  let service: PantriesService;

  // Mock Pantry
  const mockPendingPantry = {
    pantryId: 1,
    pantryName: 'Test Pantry',
    status: ApplicationStatus.PENDING,
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
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
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
        relations: ['pantryUser'],
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
        relations: ['pantryUser'],
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
        relations: ['pantryUser'],
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
          pantryUser: expect.objectContaining({
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
  describe('getApprovedPantriesWithVolunteers', () => {
    const mockVolunteer = {
      id: 10,
      firstName: 'Jane',
      lastName: 'Volunteer',
      email: 'jane@example.com',
      phone: '555-000-0001',
      role: Role.VOLUNTEER,
    } as User;
  
    const mockApprovedPantry = {
      pantryId: 1,
      pantryName: 'Approved Pantry',
      status: ApplicationStatus.APPROVED,
      pantryUser: {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        phone: '555-000-0000',
      },
      shipmentAddressLine1: '123 Main St',
      shipmentAddressCity: 'Boston',
      shipmentAddressState: 'MA',
      shipmentAddressZip: '02101',
      shipmentAddressCountry: 'US',
      allergenClients: '10 to 20',
      restrictions: ['Peanut allergy'],
      refrigeratedDonation: RefrigeratedDonation.YES,
      reserveFoodForAllergic: ReserveFoodForAllergic.YES,
      dedicatedAllergyFriendly: true,
      activities: [Activity.CREATE_LABELED_SHELF],
      itemsInStock: 'Canned goods',
      needMoreOptions: 'Fresh produce',
      newsletterSubscription: true,
      volunteers: [mockVolunteer],
    } as unknown as Pantry;
  
    it('should return approved pantries with mapped volunteer info', async () => {
      mockRepository.find.mockResolvedValueOnce([mockApprovedPantry]);
  
      const result = await service.getApprovedPantriesWithVolunteers();
  
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { status: ApplicationStatus.APPROVED },
        relations: ['volunteers', 'pantryUser'],
      });
      expect(result).toHaveLength(1);
      expect(result[0].pantryId).toBe(1);
      expect(result[0].pantryName).toBe('Approved Pantry');
      expect(result[0].volunteers).toHaveLength(1);
      expect(result[0].volunteers[0]).toEqual({
        userId: mockVolunteer.id,
        name: `${mockVolunteer.firstName} ${mockVolunteer.lastName}`,
        email: mockVolunteer.email,
        phone: mockVolunteer.phone,
        role: mockVolunteer.role,
      });
    });
  
    it('should return empty volunteers array when pantry has no volunteers', async () => {
      mockRepository.find.mockResolvedValueOnce([
        { ...mockApprovedPantry, volunteers: [] },
      ]);
  
      const result = await service.getApprovedPantriesWithVolunteers();
  
      expect(result[0].volunteers).toEqual([]);
    });
  
    it('should return empty array when no approved pantries exist', async () => {
      mockRepository.find.mockResolvedValueOnce([]);
  
      const result = await service.getApprovedPantriesWithVolunteers();
  
      expect(result).toEqual([]);
    });
  });
  
  describe('updatePantryVolunteers', () => {
    const mockVolunteer1 = {
      id: 10,
      role: Role.VOLUNTEER,
    } as User;
  
    const mockVolunteer2 = {
      id: 11,
      role: Role.VOLUNTEER,
    } as User;
  
    const mockPantryWithVolunteers = {
      ...mockPendingPantry,
      volunteers: [],
    } as unknown as Pantry;
  
    it('should update volunteers for a pantry', async () => {
      mockRepository.findOne.mockResolvedValueOnce(mockPantryWithVolunteers);
      mockUserRepository.findBy.mockResolvedValueOnce([mockVolunteer1, mockVolunteer2]);
      mockRepository.save.mockResolvedValueOnce({
        ...mockPantryWithVolunteers,
        volunteers: [mockVolunteer1, mockVolunteer2],
      });
  
      await service.updatePantryVolunteers(1, [10, 11]);
  
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { pantryId: 1 },
        relations: ['volunteers'],
      });
      expect(mockUserRepository.findBy).toHaveBeenCalledWith({ id: In([10, 11]) });
      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          volunteers: [mockVolunteer1, mockVolunteer2],
        }),
      );
    });
  
    it('should throw NotFoundException if pantry not found', async () => {
      mockRepository.findOne.mockResolvedValueOnce(null);
  
      await expect(service.updatePantryVolunteers(999, [10])).rejects.toThrow(
        new NotFoundException('Pantry with ID 999 not found'),
      );
      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  
    it('should throw NotFoundException if one or more users not found', async () => {
      mockRepository.findOne.mockResolvedValueOnce(mockPantryWithVolunteers);
      mockUserRepository.findBy.mockResolvedValueOnce([mockVolunteer1]); // only 1 returned, 2 requested
  
      await expect(service.updatePantryVolunteers(1, [10, 11])).rejects.toThrow(
        new NotFoundException('One or more users not found'),
      );
      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  
    it('should throw BadRequestException if a user is not a volunteer', async () => {
      const nonVolunteer = { id: 12, role: Role.ADMIN } as User;
      mockRepository.findOne.mockResolvedValueOnce(mockPantryWithVolunteers);
      mockUserRepository.findBy.mockResolvedValueOnce([mockVolunteer1, nonVolunteer]);
  
      await expect(service.updatePantryVolunteers(1, [10, 12])).rejects.toThrow(
        new BadRequestException('Users 12 are not volunteers'),
      );
      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });

  // TODO: once pantry service tests are fixed, uncomment this out
  // describe('findByUserId', () => {
  //   it('should return a pantry by user id', async () => {
  //     const userId = 10;
  //     const pantry = await service.findByUserId(userId);

  //     expect(pantry.pantryId).toBe(1);
  //     expect(pantry.pantryName).toBe('Community Food Pantry Downtown');
  //     expect(mockRepository.findOne).toHaveBeenCalledWith({
  //       where: { pantryUser: { id: userId } },
  //     });
  //   });

  //   it('should throw NotFoundException if pantry not found', async () => {
  //     await expect(service.findByUserId(999)).rejects.toThrow(
  //       new NotFoundException('Pantry for User 999 not found'),
  //     );
  //   });
  // });
});
