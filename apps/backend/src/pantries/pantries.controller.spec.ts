import { Test, TestingModule } from '@nestjs/testing';
import { mock } from 'jest-mock-extended';
import { PantriesController } from './pantries.controller';
import { PantriesService } from './pantries.service';
import { OrdersService } from '../orders/order.service';
import { Order } from '../orders/order.entity';
import {
  Activity,
  AllergensConfidence,
  ApprovedPantryResponse,
  ClientVisitFrequency,
  ReserveFoodForAllergic,
  ServeAllergicChildren,
} from './types';
import { RefrigeratedDonation } from './types';

const mockPantriesService = mock<PantriesService>();
const mockOrdersService = mock<OrdersService>();

describe('PantriesController', () => {
  let controller: PantriesController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PantriesController],
      providers: [
        { provide: PantriesService, useValue: mockPantriesService },
        { provide: OrdersService, useValue: mockOrdersService },
      ],
    }).compile();

    controller = module.get<PantriesController>(PantriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
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

  describe('getApprovedPantries', () => {
    it('should return approved pantries with volunteers', async () => {
      const mockApprovedPantries: ApprovedPantryResponse[] = [
        {
          pantryId: 1,
          pantryName: 'Community Food Pantry',

          contactFirstName: 'John',
          contactLastName: 'Smith',
          contactEmail: 'john.smith@example.com',
          contactPhone: '(508) 508-6789',

          shipmentAddressLine1: '123 Main Street',
          shipmentAddressCity: 'Boston',
          shipmentAddressZip: '02101',
          shipmentAddressCountry: 'United States',

          allergenClients: '10 to 20',
          restrictions: ['Peanuts', 'Dairy'],

          refrigeratedDonation: RefrigeratedDonation.YES,
          reserveFoodForAllergic: ReserveFoodForAllergic.YES,
          reservationExplanation:
            'We regularly serve clients with severe allergies.',

          dedicatedAllergyFriendly: true,

          clientVisitFrequency: ClientVisitFrequency.FEW_TIMES_A_MONTH,
          identifyAllergensConfidence: AllergensConfidence.VERY_CONFIDENT,
          serveAllergicChildren: ServeAllergicChildren.YES_MANY,

          activities: [
            Activity.POST_RESOURCE_FLYERS,
            Activity.CREATE_LABELED_SHELF,
          ],
          activitiesComments: 'Weekly food distribution events',

          itemsInStock: 'Canned goods, rice, pasta',
          needMoreOptions: 'Gluten-free and nut-free items',

          newsletterSubscription: true,
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
});
