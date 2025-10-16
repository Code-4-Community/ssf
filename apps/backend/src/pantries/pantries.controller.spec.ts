import { Test, TestingModule } from '@nestjs/testing';
import { PantriesController } from './pantries.controller';
import { PantriesService } from './pantries.service';
import { Pantry } from './pantries.entity';
import { User } from '../users/user.entity';
import { Role } from '../users/types';

describe('PantriesController', () => {
  let controller: PantriesController;
  let service: PantriesService;

  // Mock PantriesService
  const mockPantriesService = {
    getPendingPantries: jest.fn(),
    findOne: jest.fn(),
    findSSFRep: jest.fn(),
    approve: jest.fn(),
    deny: jest.fn(),
  };

  // Mock Pantry
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

  // Mock User
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
      controllers: [PantriesController],
      providers: [
        {
          provide: PantriesService,
          useValue: mockPantriesService,
        },
      ],
    }).compile();

    controller = module.get<PantriesController>(PantriesController);
    service = module.get<PantriesService>(PantriesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // Get all pantries with pending status
  describe('getPendingPantries', () => {
    it('should return an array of pending pantries', async () => {
      const result = [mockPantry];
      mockPantriesService.getPendingPantries.mockResolvedValue(result);

      expect(await controller.getPendingPantries()).toBe(result);
      expect(service.getPendingPantries).toHaveBeenCalled();
    });

    it('should return an empty array if no pending pantries', async () => {
      mockPantriesService.getPendingPantries.mockResolvedValue([]);

      expect(await controller.getPendingPantries()).toEqual([]);
      expect(service.getPendingPantries).toHaveBeenCalled();
    });
  });

  // Get pantry by ID
  describe('getPantry', () => {
    it('should return a single pantry by id', async () => {
      mockPantriesService.findOne.mockResolvedValue(mockPantry);

      expect(await controller.getPantry(1)).toBe(mockPantry);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if pantry does not exist', async () => {
      mockPantriesService.findOne.mockRejectedValue(
        new Error('Pantry 999 not found'),
      );

      await expect(controller.getPantry(999)).rejects.toThrow();
      expect(service.findOne).toHaveBeenCalledWith(999);
    });
  });

  // Get SSF representative for a pantry
  describe('getSSFRep', () => {
    it('should return the SSF representative for a pantry', async () => {
      mockPantriesService.findSSFRep.mockResolvedValue(mockUser);

      expect(await controller.getSSFRep(1)).toBe(mockUser);
      expect(service.findSSFRep).toHaveBeenCalledWith(1);
    });

    it('should throw error if pantry does not exist', async () => {
      mockPantriesService.findSSFRep.mockRejectedValue(
        new Error('Pantry 999 not found'),
      );

      await expect(controller.getSSFRep(999)).rejects.toThrow();
      expect(service.findSSFRep).toHaveBeenCalledWith(999);
    });
  });

  // Approve pantry by ID (status = approved)
  describe('approvePantry', () => {
    it('should approve a pantry', async () => {
      mockPantriesService.approve.mockResolvedValue(undefined);

      await controller.approvePantry(1);

      expect(service.approve).toHaveBeenCalledWith(1);
    });

    it('should throw error if pantry does not exist', async () => {
      mockPantriesService.approve.mockRejectedValue(
        new Error('Pantry 999 not found'),
      );

      await expect(controller.approvePantry(999)).rejects.toThrow();
      expect(service.approve).toHaveBeenCalledWith(999);
    });
  });

  // Deny pantry by ID (status = denied)
  describe('denyPantry', () => {
    it('should deny a pantry', async () => {
      mockPantriesService.deny.mockResolvedValue(undefined);

      await controller.denyPantry(1);

      expect(service.deny).toHaveBeenCalledWith(1);
    });

    it('should throw error if pantry does not exist', async () => {
      mockPantriesService.deny.mockRejectedValue(
        new Error('Pantry 999 not found'),
      );

      await expect(controller.denyPantry(999)).rejects.toThrow();
      expect(service.deny).toHaveBeenCalledWith(999);
    });
  });
});
