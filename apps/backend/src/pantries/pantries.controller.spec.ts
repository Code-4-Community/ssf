import { Test, TestingModule } from '@nestjs/testing';
import { PantriesController } from './pantries.controller';
import { PantriesService } from './pantries.service';
import { Pantry } from './pantries.entity';
import { Role } from '../users/types';
import { mock } from 'jest-mock-extended';
import { PantryApplicationDto } from './dtos/pantry-application.dto';
import { OrdersService } from '../orders/order.service';
import { Order } from '../orders/order.entity';
import {
  Activity,
  AllergensConfidence,
  ClientVisitFrequency,
  PantryStatus,
  RefrigeratedDonation,
  ReserveFoodForAllergic,
  ServeAllergicChildren,
} from './types';
import { EmailsService } from '../emails/email.service';

const mockPantriesService = mock<PantriesService>();
const mockOrdersService = mock<OrdersService>();
const mockEmailsService = mock<EmailsService>();

describe('PantriesController', () => {
  let controller: PantriesController;

  const mockUser = {
    id: 1,
    role: Role.VOLUNTEER,
    firstName: 'John',
    lastName: 'Doe',
    email: '',
    phone: '123-456-7890',
  };

  // Mock Pantry
  const mockPantry = {
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
      controllers: [PantriesController],
      providers: [
        {
          provide: PantriesService,
          useValue: mockPantriesService,
        },
        {
          provide: OrdersService,
          useValue: mockOrdersService,
        },
        {
          provide: EmailsService,
          useValue: mockEmailsService,
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
    });
  });
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
