import { Test, TestingModule } from '@nestjs/testing';
import { PantriesController } from './pantries.controller';
import { PantriesService } from './pantries.service';
import { Pantry } from './pantries.entity';
import { User } from '../users/user.entity';
import { Role } from '../users/types';
import { mock } from 'jest-mock-extended';
import { PantryApplicationDto } from './dtos/pantry-application.dto';

const mockPantriesService = mock<PantriesService>();
import { OrdersService } from '../orders/order.service';
import { Order } from '../orders/order.entity';
const mockOrdersService = mock<OrdersService>();

describe('PantriesController', () => {
  let controller: PantriesController;

  const mockUser = {
    id: 1,
    role: Role.STANDARD_VOLUNTEER,
    firstName: 'John',
    lastName: 'Doe',
    email: '',
    phone: '123-456-7890',
  };

  const mockPantry = {
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

  const mockPantryApplication = {
    contactFirstName: 'John',
    contactLastName: 'Doe',
    contactEmail: 'john.doe@example.com',
    contactPhone: '(508) 111-1111',
    pantryName: 'Community Food Pantry',
    addressLine1: '123 Test Street',
    addressCity: 'Boston',
    addressState: 'MA',
    addressZip: '02101',
    allergenClients: '10',
    restrictions: ['Egg allergy'],
    refrigeratedDonation: 'Yes',
    reserveFoodForAllergic: 'Some',
    dedicatedAllergyFriendly: 'Yes',
    activities: [],
    itemsInStock: 'Rice, pasta',
    needMoreOptions: 'More options needed',
    newsletterSubscription: 'Yes',
  } as PantryApplicationDto;

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
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getPendingPantries', () => {
    it('should return an array of pending pantries', async () => {
      mockPantriesService.getPendingPantries.mockResolvedValueOnce([
        mockPantry,
      ] as Pantry[]);

      const result = await controller.getPendingPantries();

      expect(result).toEqual([mockPantry] as Pantry[]);
      expect(mockPantriesService.getPendingPantries).toHaveBeenCalled();
    });

    it('should return an empty array if no pending pantries', async () => {
      mockPantriesService.getPendingPantries.mockResolvedValueOnce([]);

      const result = await controller.getPendingPantries();

      expect(result).toEqual([]);
      expect(mockPantriesService.getPendingPantries).toHaveBeenCalled();
    });
  });

  describe('getPantry', () => {
    it('should return a single pantry by id', async () => {
      mockPantriesService.findOne.mockResolvedValueOnce(mockPantry as Pantry);

      const result = await controller.getPantry(1);

      expect(result).toEqual(mockPantry as Pantry);
      expect(mockPantriesService.findOne).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if pantry does not exist', async () => {
      mockPantriesService.findOne.mockRejectedValueOnce(
        new Error('Pantry 999 not found'),
      );

      await expect(controller.getPantry(999)).rejects.toThrow();
      expect(mockPantriesService.findOne).toHaveBeenCalledWith(999);
    });
  });

  describe('getSSFRep', () => {
    it('should return the SSF representative for a pantry', async () => {
      mockPantriesService.findSSFRep.mockResolvedValueOnce(mockUser as User);

      const result = await controller.getSSFRep(1);

      expect(result).toEqual(mockUser as User);
      expect(mockPantriesService.findSSFRep).toHaveBeenCalledWith(1);
    });

    it('should throw error if pantry does not exist', async () => {
      mockPantriesService.findSSFRep.mockRejectedValueOnce(
        new Error('Pantry 999 not found'),
      );

      await expect(controller.getSSFRep(999)).rejects.toThrow();
      expect(mockPantriesService.findSSFRep).toHaveBeenCalledWith(999);
    });
  });

  describe('approvePantry', () => {
    it('should approve a pantry', async () => {
      mockPantriesService.approve.mockResolvedValueOnce(undefined);

      await controller.approvePantry(1);

      expect(mockPantriesService.approve).toHaveBeenCalledWith(1);
    });

    it('should throw error if pantry does not exist', async () => {
      mockPantriesService.approve.mockRejectedValueOnce(
        new Error('Pantry 999 not found'),
      );

      await expect(controller.approvePantry(999)).rejects.toThrow();
      expect(mockPantriesService.approve).toHaveBeenCalledWith(999);
    });
  });

  describe('denyPantry', () => {
    it('should deny a pantry', async () => {
      mockPantriesService.deny.mockResolvedValueOnce(undefined);

      await controller.denyPantry(1);

      expect(mockPantriesService.deny).toHaveBeenCalledWith(1);
    });

    it('should throw error if pantry does not exist', async () => {
      mockPantriesService.deny.mockRejectedValueOnce(
        new Error('Pantry 999 not found'),
      );

      await expect(controller.denyPantry(999)).rejects.toThrow();
      expect(mockPantriesService.deny).toHaveBeenCalledWith(999);
    });
  });

  describe('submitPantryApplication', () => {
    it('should submit a pantry application successfully', async () => {
      mockPantriesService.addPantry.mockResolvedValueOnce(undefined);

      await controller.submitPantryApplication(mockPantryApplication);

      expect(mockPantriesService.addPantry).toHaveBeenCalledWith(
        mockPantryApplication,
      );
    });

    it('should throw error if application data is invalid', async () => {
      mockPantriesService.addPantry.mockRejectedValueOnce(
        new Error('Invalid application data'),
      );

      await expect(
        controller.submitPantryApplication(mockPantryApplication),
      ).rejects.toThrow();
      expect(mockPantriesService.addPantry).toHaveBeenCalledWith(
        mockPantryApplication,
      );
  describe('getOrders', () => {
    it('should return orders for a pantry', async () => {
      const pantryId = 24;

      const mockOrders: Partial<Order>[] = [
        {
          orderId: 26,
          requestId: 26,
          shippedBy: 32,
        },
        {
          orderId: 27,
          requestId: 27,
          shippedBy: 33,
        },
      ];

      mockOrdersService.getOrdersByPantry.mockResolvedValue(
        mockOrders as Order[],
      );

      const result = await controller.getOrders(pantryId);

      expect(result).toEqual(mockOrders);
      expect(result).toHaveLength(2);
      expect(result[0].orderId).toBe(26);
      expect(result[1].orderId).toBe(27);
      expect(mockOrdersService.getOrdersByPantry).toHaveBeenCalledWith(24);
    });
  });
});
