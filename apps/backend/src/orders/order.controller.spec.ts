import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from './order.controller';
import { OrdersService } from './order.service';
import { AllocationsService } from '../allocations/allocations.service';
import { Order } from './order.entity';
import { Allocation } from '../allocations/allocations.entity';
import { mock } from 'jest-mock-extended';
import { OrderStatus } from './types';
import { FoodRequest } from '../foodRequests/request.entity';
import { Pantry } from '../pantries/pantries.entity';
import { TrackingCostDto } from './dtos/tracking-cost.dto';
import { OrderDetailsDto } from '../foodRequests/dtos/order-details.dto';
import { FoodType } from '../donationItems/types';

const mockOrdersService = mock<OrdersService>();
const mockAllocationsService = mock<AllocationsService>();

describe('OrdersController', () => {
  let controller: OrdersController;

  const mockPantries: Partial<Pantry>[] = [
    { pantryId: 1, pantryName: 'Test Pantry' },
    { pantryId: 2, pantryName: 'Test Pantry 2' },
    { pantryId: 3, pantryName: 'Test Pantry 3' },
  ];

  const mockRequests: Partial<FoodRequest>[] = [
    { requestId: 1, pantry: mockPantries[0] as Pantry },
    { requestId: 2, pantry: mockPantries[1] as Pantry },
    { requestId: 3, pantry: mockPantries[2] as Pantry },
  ];

  const mockOrders: Partial<Order>[] = [
    {
      orderId: 1,
      status: OrderStatus.PENDING,
      request: mockRequests[0] as FoodRequest,
    },
    {
      orderId: 2,
      status: OrderStatus.DELIVERED,
      request: mockRequests[1] as FoodRequest,
    },
    {
      orderId: 3,
      status: OrderStatus.SHIPPED,
      request: mockRequests[2] as FoodRequest,
    },
  ];

  const mockAllocations: Partial<Allocation>[] = [
    { allocationId: 1, orderId: 1 },
    { allocationId: 2, orderId: 1 },
    { allocationId: 3, orderId: 2 },
  ];

  const mockOrderDetails: Partial<OrderDetailsDto>[] = [
    {
      orderId: 1,
      status: OrderStatus.DELIVERED,
      foodManufacturerName: 'food manufacturer 1',
      trackingLink: 'example-link.com',
      items: [
        {
          name: 'item1',
          quantity: 10,
          foodType: FoodType.DAIRY_FREE_ALTERNATIVES,
        },
      ],
    },
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

  describe('getOrderDetails', () => {
    it('should call ordersService.findOrderDetails and return order details', async () => {
      mockOrdersService.findOrderDetails.mockResolvedValueOnce(
        mockOrderDetails[0] as OrderDetailsDto,
      );

      const orderId = 1;

      const result = await controller.getOrderDetails(orderId);

      expect(result).toEqual(mockOrderDetails[0] as OrderDetailsDto);
      expect(mockOrdersService.findOrderDetails).toHaveBeenCalledWith(orderId);
    });
  });

  describe('getAllOrders', () => {
    it('should call ordersService.getAll and return orders', async () => {
      const status = 'pending';
      const pantryNames = ['Test Pantry', 'Test Pantry 2'];
      mockOrdersService.getAll.mockResolvedValueOnce(
        mockOrders.slice(0, 2) as Order[],
      );

      const result = await controller.getAllOrders(status, pantryNames);

      expect(result).toEqual(mockOrders.slice(0, 2) as Order[]);
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

  describe('updateTrackingCostInfo', () => {
    it('should call ordersService.updateTrackingCostInfo with correct parameters', async () => {
      const orderId = 1;
      const trackingLink = 'www.samplelink/samplelink';
      const shippingCost = 15.99;
      const dto: TrackingCostDto = { trackingLink, shippingCost };

      await controller.updateTrackingCostInfo(orderId, dto);

      expect(mockOrdersService.updateTrackingCostInfo).toHaveBeenCalledWith(
        orderId,
        dto,
      );
    });
  });
});
