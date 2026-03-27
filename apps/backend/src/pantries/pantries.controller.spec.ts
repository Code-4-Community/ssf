import { Test, TestingModule } from '@nestjs/testing';
import { PantriesController } from './pantries.controller';
import { PantriesService } from './pantries.service';
import { Pantry } from './pantries.entity';
import { mock } from 'jest-mock-extended';
import { PantryApplicationDto } from './dtos/pantry-application.dto';
import { OrdersService } from '../orders/order.service';
import { Order } from '../orders/order.entity';
import {
  Activity,
  AllergensConfidence,
  ClientVisitFrequency,
  PantryStats,
  RefrigeratedDonation,
  ReserveFoodForAllergic,
  ServeAllergicChildren,
  ApprovedPantryResponse,
  TotalStats,
} from './types';
import { EmailsService } from '../emails/email.service';
import { ApplicationStatus } from '../shared/types';
import { User } from '../users/users.entity';
import { AuthenticatedRequest } from '../auth/authenticated-request';
import { UpdatePantryApplicationDto } from './dtos/update-pantry-application.dto';

const mockPantriesService = mock<PantriesService>();
const mockOrdersService = mock<OrdersService>();
const mockEmailsService = mock<EmailsService>();

describe('PantriesController', () => {
  let controller: PantriesController;

  // Mock Pantry
  const mockPantry = {
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
    emailContactOther: undefined,
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

  describe('getAvailableYears', () => {
    it('should return an array of years', async () => {
      const mockYears = [2025, 2024];
      mockPantriesService.getAvailableYears.mockResolvedValueOnce(mockYears);

      const result = await controller.getAvailableYears();

      expect(result).toEqual(mockYears);
      expect(mockPantriesService.getAvailableYears).toHaveBeenCalled();
    });

    it('should return an empty array when no approved pantry orders exist', async () => {
      mockPantriesService.getAvailableYears.mockResolvedValueOnce([]);

      const result = await controller.getAvailableYears();

      expect(result).toEqual([]);
      expect(mockPantriesService.getAvailableYears).toHaveBeenCalled();
    });
  });

  describe('getApprovedPantryNames', () => {
    it('should return an array of approved pantry names', async () => {
      const mockNames = ['Pantry A', 'Pantry B'];
      mockPantriesService.getApprovedPantryNames.mockResolvedValueOnce(
        mockNames,
      );

      const result = await controller.getApprovedPantryNames();

      expect(result).toEqual(mockNames);
      expect(mockPantriesService.getApprovedPantryNames).toHaveBeenCalled();
    });

    it('should return an empty array if no approved pantries exist', async () => {
      mockPantriesService.getApprovedPantryNames.mockResolvedValueOnce([]);

      const result = await controller.getApprovedPantryNames();

      expect(result).toEqual([]);
      expect(mockPantriesService.getApprovedPantryNames).toHaveBeenCalled();
    });
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
    it('should return a pantry by ID', async () => {
      const mockUser: Partial<User> = {
        id: 1,
        firstName: 'Test',
        lastName: 'User',
        email: 'test@test.com',
      };
      const mockPantry: Partial<Pantry> = {
        pantryId: 1,
        pantryName: 'Test Pantry',
        pantryUser: mockUser as User,
      };

      mockPantriesService.findOne.mockResolvedValue(mockPantry as Pantry);

      const result = await controller.getPantry(1);
      expect(result).toEqual(mockPantry);
      expect(result.pantryUser).toEqual(mockUser);
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

  describe('PATCH /:pantryId/application', () => {
    const req = { user: { id: 1 } };

    it('should update a pantry application', async () => {
      const pantryId = 1;

      const mockUpdateData: UpdatePantryApplicationDto = {
        secondaryContactFirstName: 'John',
        secondaryContactLastName: 'Doe',
        secondaryContactEmail: 'john.doe@example.com',
        refrigeratedDonation: RefrigeratedDonation.NO,
        reserveFoodForAllergic: ReserveFoodForAllergic.NO,
        newsletterSubscription: false,
        itemsInStock: 'Canned beans, rice',
      };

      mockPantriesService.updatePantryApplication.mockResolvedValue(
        mockPantry as Pantry,
      );

      const result = await controller.updatePantryApplication(
        req as AuthenticatedRequest,
        pantryId,
        mockUpdateData,
      );

      expect(mockPantriesService.updatePantryApplication).toHaveBeenCalledWith(
        pantryId,
        mockUpdateData,
        1,
      );

      expect(result).toEqual(mockPantry);
    });

    it('should throw error if pantry does not exist', async () => {
      const mockUpdateData: UpdatePantryApplicationDto = {
        secondaryContactFirstName: 'John',
      };

      mockPantriesService.updatePantryApplication.mockRejectedValueOnce(
        new Error('Pantry 999 not found'),
      );

      await expect(
        controller.updatePantryApplication(
          req as AuthenticatedRequest,
          999,
          mockUpdateData,
        ),
      ).rejects.toThrow();
      expect(mockPantriesService.updatePantryApplication).toHaveBeenCalledWith(
        999,
        mockUpdateData,
        1,
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
          foodManufacturerId: 32,
        },
        {
          orderId: 27,
          requestId: 27,
          foodManufacturerId: 33,
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

  describe('getApprovedPantries', () => {
    it('should return approved pantries with volunteers', async () => {
      const mockApprovedPantries: ApprovedPantryResponse[] = [
        {
          pantryId: 1,
          pantryName: 'Community Food Pantry',
          refrigeratedDonation: RefrigeratedDonation.YES,
          volunteers: [
            {
              userId: 10,
              firstName: 'Alice',
              lastName: 'Johnson',
              email: 'alice.johnson@example.com',
              phone: '(617) 555-0100',
            },
            {
              userId: 11,
              firstName: 'Bob',
              lastName: 'Williams',
              email: 'bob.williams@example.com',
              phone: '(617) 555-0101',
            },
          ],
        },
      ];

      mockPantriesService.getApprovedPantriesWithVolunteers.mockResolvedValue(
        mockApprovedPantries,
      );

      const result = await controller.getApprovedPantries();

      expect(result).toEqual(mockApprovedPantries);
      expect(
        mockPantriesService.getApprovedPantriesWithVolunteers,
      ).toHaveBeenCalledTimes(1);
    });
  });

  describe('updatePantryVolunteers', () => {
    it('should overwrite the set of volunteers assigned to a pantry', async () => {
      const pantryId = 1;
      const volunteerIds = [10, 11, 12];

      mockPantriesService.updatePantryVolunteers.mockResolvedValue(undefined);

      await controller.updatePantryVolunteers(pantryId, volunteerIds);

      expect(mockPantriesService.updatePantryVolunteers).toHaveBeenCalledWith(
        pantryId,
        volunteerIds,
      );
    });
  });
  describe('getCurrentUserPantryId', () => {
    it('returns pantryId for authenticated user', async () => {
      const req = { user: { id: 1 } };
      const pantry: Partial<Pantry> = { pantryId: 10 };
      mockPantriesService.findByUserId.mockResolvedValueOnce(pantry as Pantry);

      const result = await controller.getCurrentUserPantryId(
        req as AuthenticatedRequest,
      );

      expect(result).toEqual(10);
      expect(mockPantriesService.findByUserId).toHaveBeenCalledWith(1);
    });
  });

  describe('getPantryStats', () => {
    it('should return stats for all pantries', async () => {
      const mockStats: PantryStats[] = [
        {
          pantryId: 1,
          pantryName: 'Community Food Pantry Downtown',
          totalItems: 100,
          totalOz: 1600,
          totalLbs: 100,
          totalDonatedFoodValue: 500,
          totalShippingCost: 50,
          totalValue: 550,
          percentageFoodRescueItems: 80,
        },
      ];

      mockPantriesService.getPantryStats.mockResolvedValueOnce(mockStats);

      const result = await controller.getPantryStats();

      expect(result).toEqual(mockStats);
      expect(mockPantriesService.getPantryStats).toHaveBeenCalled();
    });

    it('should forward query parameters to service', async () => {
      const mockStats: PantryStats[] = [];
      mockPantriesService.getPantryStats.mockResolvedValueOnce(mockStats);

      const pantryNames = ['A', 'B'];
      const years = [2024, 2025];
      const page = 3;

      const result = await controller.getPantryStats(pantryNames, years, page);

      expect(result).toEqual(mockStats);
      expect(mockPantriesService.getPantryStats).toHaveBeenCalledWith(
        pantryNames,
        years,
        page,
      );
    });
  });

  describe('getTotalStats', () => {
    it('should return total stats across all pantries', async () => {
      const mockTotalStats: TotalStats = {
        totalItems: 500,
        totalOz: 8000,
        totalLbs: 500,
        totalDonatedFoodValue: 2500,
        totalShippingCost: 200,
        totalValue: 2700,
        percentageFoodRescueItems: 75,
      };

      mockPantriesService.getTotalStats.mockResolvedValueOnce(mockTotalStats);

      const result = await controller.getTotalStats();

      expect(result).toEqual(mockTotalStats);
      expect(mockPantriesService.getTotalStats).toHaveBeenCalled();
    });

    it('should forward years query parameter to service', async () => {
      const mockTotalStats: TotalStats = {
        totalItems: 500,
        totalOz: 8000,
        totalLbs: 500,
        totalDonatedFoodValue: 2500,
        totalShippingCost: 200,
        totalValue: 2700,
        percentageFoodRescueItems: 75,
      };

      mockPantriesService.getTotalStats.mockResolvedValueOnce(mockTotalStats);

      const years = [2024, 2025];
      const result = await controller.getTotalStats(years);

      expect(result).toEqual(mockTotalStats);
      expect(mockPantriesService.getTotalStats).toHaveBeenCalledWith(years);
    });
  });
});
