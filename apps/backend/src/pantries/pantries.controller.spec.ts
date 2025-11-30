import { Test, TestingModule } from '@nestjs/testing';
import { mock } from 'jest-mock-extended';
import { Pantry } from './pantries.entity';
import { PantriesController } from './pantries.controller';
import { PantriesService } from './pantries.service';
import { OrdersService } from '../orders/order.service';
import { Order } from '../orders/order.entity';
import { Donation } from '../donations/donations.entity';
import { FoodManufacturer } from '../foodManufacturers/manufacturer.entity';
import { FoodRequest } from '../foodRequests/request.entity';
import { RequestSize } from '../foodRequests/types';

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


      const mockOrders = [
        {
          orderId: 26,
          requestId: 26,
          shippedBy: 32,
          status: 'delivered',
          createdAt: new Date('2024-03-02T15:00:00.000Z'),
          shippedAt: new Date('2024-03-02T20:00:00.000Z'),
          deliveredAt: new Date('2024-03-03T19:00:00.000Z'),
          pantry: { pantryId: 24 } as Pantry,
          foodManufacturer: { foodManufacturerId: 32 } as FoodManufacturer,
          donation: { donationId: 1 } as Donation,
          request: {
            requestId: 26,
            pantryId: 24,
            requestedSize: RequestSize.MEDIUM,
            requestedItems: ['canned_vegetables', 'grains'],
            additionalInformation: 'Regular production pantry order',
            requestedAt: new Date('2024-03-02T14:00:00.000Z'),
            dateReceived: new Date('2024-03-03T19:00:00.000Z'),
            feedback: 'Good selection of items',
            photos: ['prod_photo1.jpg'],
            order: null,
          } as FoodRequest,
        } as Order,
        {
          orderId: 27,
          requestId: 27,
          shippedBy: 33,
          status: 'shipped',
          createdAt: new Date('2024-03-04T10:00:00.000Z'),
          shippedAt: new Date('2024-03-04T14:00:00.000Z'),
          deliveredAt: null,
          pantry: { pantryId: 24 } as Pantry,
          foodManufacturer: { foodManufacturerId: 33 } as FoodManufacturer,
          donation: { donationId: 2 } as Donation,
          request: {
            requestId: 27,
            pantryId: 24,
            requestedSize: RequestSize.LARGE,
            requestedItems: ['dairy_free', 'gluten_free', 'nuts'],
            additionalInformation: 'Urgent request for allergy-friendly items',
            requestedAt: new Date('2024-03-04T09:00:00.000Z'),
            dateReceived: null,
            feedback: null,
            photos: [],
            order: null,
          } as FoodRequest,
        } as Order,
      ];

      mockOrdersService.getOrdersByPantry.mockResolvedValue(mockOrders);

      const result = await controller.getOrders(pantryId);

      expect(result).toEqual(mockOrders);
      expect(result).toHaveLength(2);
      expect(result[0].orderId).toBe(26);
      expect(result[1].orderId).toBe(27);
      expect(mockOrdersService.getOrdersByPantry).toHaveBeenCalledWith(24);
    });
  });
});
