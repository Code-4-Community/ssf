import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from './order.controller';
import { OrdersService } from './order.service';
import { AllocationsService } from '../allocations/allocations.service';
import { Order } from './order.entity';
import { Allocation } from '../allocations/allocations.entity';
import { mock } from 'jest-mock-extended';
import { OrderStatus } from './types';
import { TrackingCostDto } from './dtos/tracking-cost.dto';

const mockOrdersService = mock<OrdersService>();
const mockAllocationsService = mock<AllocationsService>();

describe('OrdersController', () => {
  let controller: OrdersController;

  const mockOrders: Partial<Order>[] = [
    { orderId: 1, status: OrderStatus.PENDING },
    { orderId: 2, status: OrderStatus.DELIVERED },
  ];

  const mockAllocations: Partial<Allocation>[] = [
    { allocationId: 1, orderId: 1 },
    { allocationId: 2, orderId: 1 },
    { allocationId: 3, orderId: 2 },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        { provide: OrdersService, useValue: mockOrdersService },
        { provide: AllocationsService, useValue: mockAllocationsService },
      ],
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllOrders', () => {
    it('should call ordersService.getAll and return orders', async () => {
      const status = 'pending';
      const pantryNames = ['Test Pantry', 'Test Pantry 2'];
      mockOrdersService.getAll.mockResolvedValueOnce([
        mockOrders[0],
      ] as Order[]);

      const result = await controller.getAllOrders(status, pantryNames);

      expect(result).toEqual([mockOrders[0]] as Order[]);
      expect(mockOrdersService.getAll).toHaveBeenCalledWith({
        status,
        pantryNames,
      });
    });
  });

  describe('getAllAllocationsByOrder', () => {
    it('should call allocationsService.getAllAllocationsByOrder and return allocations', async () => {
      const orderId = 1;
      mockAllocationsService.getAllAllocationsByOrder.mockResolvedValueOnce(
        mockAllocations.slice(0, 2) as Allocation[],
      );

      const result = await controller.getAllAllocationsByOrder(orderId);

      expect(result).toEqual(mockAllocations.slice(0, 2) as Allocation[]);
      expect(
        mockAllocationsService.getAllAllocationsByOrder,
      ).toHaveBeenCalledWith(orderId);
    });
  });

  describe('updateTrackingAndCost', () => {
    it('should call ordersService.updateTrackingAndCost with correct parameters', async () => {
      const orderId = 1;
      const trackingLink = 'www.samplelink/samplelink';
      const shippingCost = 15.99;
      const dto: TrackingCostDto = { trackingLink, shippingCost };

      await controller.updateTrackingAndCost(orderId, dto);

      expect(mockOrdersService.updateTrackingAndCost).toHaveBeenCalledWith(
        orderId,
        dto,
      );
    });
  });
});
