import { Test, TestingModule } from '@nestjs/testing';
import { PantriesService } from './pantries.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Pantry } from './pantries.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { User } from '../users/user.entity';
import { Role } from '../users/types';

// Mock the validation utils
jest.mock('../utils/validation.utils', () => ({
  validateId: jest.fn(),
}));

describe('PantriesService', () => {
  let service: PantriesService;
  let repository: Repository<Pantry>;

  const mockRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    update: jest.fn(),
  };

  const mockPantry = {
    pantryId: 1,
    pantryName: 'Test Pantry',
    address: '123 Test St',
    allergenClients: 'Yes',
    refrigeratedDonation: 'Yes',
    reservationExplanation: 'We reserve food for allergic clients.',
    dedicatedAllergyFriendly: 'Yes',
    clientVisitFrequency: 'Weekly',
    identifyAllergensConfidence: 'High',
    serveAllergicChildren: 'Yes',
    newsletterSubscription: true,
    restrictions: ['Peanuts', 'Dairy'],
    ssfRepresentative: null,
    reserveFoodForAllergic: true,
    pantryRepresentative: null,
    status: 'pending',
    dateApplied: new Date(),
    activities: '',
    questions: '',
    itemsInStock: '',
    needMoreOptions: '',
  } as unknown as Pantry;

  const mockUser = {
    id: 1,
    role: Role.STANDARD_VOLUNTEER,
    firstName: 'John',
    lastName: 'Doe',
    email: '',
    phone: '123-456-7890',
  } as unknown as User;

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
    repository = module.get<Repository<Pantry>>(getRepositoryToken(Pantry));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should return a pantry by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockPantry);

      const result = await service.findOne(1);

      expect(result).toBe(mockPantry);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { pantryId: 1 },
      });
    });

    it('should throw NotFoundException if pantry not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(999)).rejects.toThrow(
        'Pantry 999 not found',
      );
    });
  });

  describe('getPendingPantries', () => {
    it('should return all pending pantries', async () => {
      const pendingPantries = [mockPantry, { ...mockPantry, pantryId: 2 }];
      mockRepository.find.mockResolvedValue(pendingPantries);

      const result = await service.getPendingPantries();

      expect(result).toBe(pendingPantries);
      expect(repository.find).toHaveBeenCalledWith({
        where: { status: 'pending' },
      });
    });

    it('should return an empty array if no pending pantries', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.getPendingPantries();

      expect(result).toEqual([]);
    });
  });

  describe('approve', () => {
    it('should approve a pantry', async () => {
      mockRepository.findOne.mockResolvedValue(mockPantry);
      mockRepository.update.mockResolvedValue({ affected: 1 });

      await service.approve(1);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { pantryId: 1 },
      });
      expect(repository.update).toHaveBeenCalledWith(1, {
        status: 'approved',
      });
    });

    it('should throw NotFoundException if pantry not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.approve(999)).rejects.toThrow(NotFoundException);
      await expect(service.approve(999)).rejects.toThrow(
        'Pantry 999 not found',
      );
      expect(repository.update).not.toHaveBeenCalled();
    });
  });

  describe('deny', () => {
    it('should deny a pantry', async () => {
      mockRepository.findOne.mockResolvedValue(mockPantry);
      mockRepository.update.mockResolvedValue({ affected: 1 });

      await service.deny(1);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { pantryId: 1 },
      });
      expect(repository.update).toHaveBeenCalledWith(1, { status: 'denied' });
    });

    it('should throw NotFoundException if pantry not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.deny(999)).rejects.toThrow(NotFoundException);
      await expect(service.deny(999)).rejects.toThrow('Pantry 999 not found');
      expect(repository.update).not.toHaveBeenCalled();
    });
  });

  describe('findSSFRep', () => {
    it('should return the SSF representative for a pantry', async () => {
      const pantryWithRep = {
        ...mockPantry,
        ssfRepresentative: mockUser,
      };
      mockRepository.findOne.mockResolvedValue(pantryWithRep);

      const result = await service.findSSFRep(1);

      expect(result).toBe(mockUser);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { pantryId: 1 },
        relations: ['ssfRepresentative'],
      });
    });

    it('should throw NotFoundException if pantry not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findSSFRep(999)).rejects.toThrow(NotFoundException);
      await expect(service.findSSFRep(999)).rejects.toThrow(
        'Pantry 999 not found',
      );
    });
  });
});
