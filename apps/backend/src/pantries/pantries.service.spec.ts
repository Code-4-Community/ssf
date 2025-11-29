import { Test, TestingModule } from '@nestjs/testing';
import { PantriesService } from './pantries.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Pantry } from './pantries.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { Role } from '../users/types';
import { mock } from 'jest-mock-extended';
import { PantryApplicationDto } from './dtos/pantry-application.dto';

jest.mock('../utils/validation.utils', () => ({
  validateId: jest.fn(),
}));

const mockRepository = mock<Repository<Pantry>>();

describe('PantriesService', () => {
  let service: PantriesService;

  const mockUser = {
    id: 1,
    role: Role.STANDARD_VOLUNTEER,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '123-456-7890',
  };

  // Mock Pantry
  const mockPendingPantry = {
    pantryId: 1,
    pantryName: 'Test Pantry',
    addressLine1: '123 Test St',
    addressCity: 'Boston',
    addressState: 'MA',
    addressZip: '02115',
    allergenClients: 'Yes',
    refrigeratedDonation: 'Yes',
    reserveFoodForAllergic: 'Yes',
    dedicatedAllergyFriendly: 'Yes',
    newsletterSubscription: true,
    restrictions: ['Peanuts', 'Dairy'],
    pantryRepresentative: mockUser,
    status: 'pending',
    dateApplied: new Date(),
    activities: ['Food Distribution'],
    itemsInStock: 'Canned goods',
    needMoreOptions: 'More options needed',
  } as Pantry;

  // Mock Pantry Application
  const mockPantryApplication = {
    contactFirstName: 'Jane',
    contactLastName: 'Smith',
    contactEmail: 'jane.smith@example.com',
    contactPhone: '(508) 222-2222',
    pantryName: 'New Community Pantry',
    addressLine1: '456 New St',
    addressCity: 'Cambridge',
    addressState: 'MA',
    addressZip: '02139',
    allergenClients: '15',
    restrictions: ['Peanut allergy', 'Gluten'],
    refrigeratedDonation: 'Yes',
    reserveFoodForAllergic: 'Yes',
    dedicatedAllergyFriendly: 'No',
    activities: ['Food distribution', 'Counseling'],
    itemsInStock: 'Canned goods, pasta',
    needMoreOptions: 'More fresh produce',
    newsletterSubscription: 'Yes',
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

  // Find SSF representative for a pantry (relations field)
  describe('findSSFRep', () => {
    it('should return the SSF representative for a pantry', async () => {
      const pantryWithRep = {
        ...mockPendingPantry,
        ssfRepresentative: mockUser,
      };
      mockRepository.findOne.mockResolvedValueOnce(pantryWithRep);

      const result = await service.findSSFRep(1);

      expect(result).toEqual(mockUser);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { pantryId: 1 },
        relations: ['ssfRepresentative'],
      });
    });

    it('should throw NotFoundException if pantry not found', async () => {
      mockRepository.findOne.mockResolvedValueOnce(null);

      await expect(service.findSSFRep(999)).rejects.toThrow(NotFoundException);
      await expect(service.findSSFRep(999)).rejects.toThrow(
        'Pantry 999 not found',
      );
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
          addressLine1: mockPantryApplication.addressLine1,
          addressCity: mockPantryApplication.addressCity,
          addressState: mockPantryApplication.addressState,
          addressZip: mockPantryApplication.addressZip,
          allergenClients: mockPantryApplication.allergenClients,
          restrictions: mockPantryApplication.restrictions,
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
