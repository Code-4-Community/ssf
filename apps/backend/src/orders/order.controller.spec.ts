import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from './order.controller';
import { OrdersService } from './order.service';
import { AllocationsService } from '../allocations/allocations.service';
import { Order } from './order.entity';
import { Allocation } from '../allocations/allocations.entity';

describe('OrdersController', () => {
  let controller: OrdersController;
  let ordersService: OrdersService;
  let allocationsService: AllocationsService;

  const mockOrders: Order[] = [
    { orderId: 1, status: 'pending' } as Order,
    { orderId: 2, status: 'delivered' } as Order,
  ];

  const mockAllocations = [
    { allocationId: 1, orderId: 1 } as Allocation,
    { allocationId: 2, orderId: 1 } as Allocation,
    { allocationId: 3, orderId: 2 } as Allocation,
  ];

  const mockOrdersService = {
    getAll: jest.fn().mockResolvedValue(mockOrders[0]),
  };

  const mockAllocationsService = {
    getAllAllocationsByOrder: jest
      .fn()
      .mockResolvedValue(mockAllocations.slice(0, 2)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        { provide: OrdersService, useValue: mockOrdersService },
        { provide: AllocationsService, useValue: mockAllocationsService },
      ],
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
    ordersService = module.get<OrdersService>(OrdersService);
    allocationsService = module.get<AllocationsService>(AllocationsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllOrders', () => {
    it('should call ordersService.getAll and return orders', async () => {
      const status = 'pending';
      const pantryName = 'Test Pantry';

      const result = await controller.getAllOrders(status, pantryName);

      expect(result).toEqual(mockOrders[0]);
      expect(ordersService.getAll).toHaveBeenCalledWith({ status, pantryName });
    });
  });

  describe('getAllAllocationsByOrder', () => {
    it('should call allocationsService.getAllAllocationsByOrder and return allocations', async () => {
      const orderId = 1;

      const result = await controller.getAllAllocationsByOrder(orderId);

      expect(result).toEqual(mockAllocations.slice(0, 2));
      expect(allocationsService.getAllAllocationsByOrder).toHaveBeenCalledWith(
        orderId,
      );
    });
  });
});
