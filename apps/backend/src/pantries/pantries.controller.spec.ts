import { Test, TestingModule } from '@nestjs/testing';
import { mock } from 'jest-mock-extended';
import { PantriesController } from './pantries.controller';
import { PantriesService } from './pantries.service';
import { OrdersService } from '../orders/order.service';
import { Order } from '../orders/order.entity';

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
});
