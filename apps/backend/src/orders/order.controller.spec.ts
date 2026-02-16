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
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { FoodManufacturer } from '../foodManufacturers/manufacturers.entity';

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

  const mockFoodManufacturer: Partial<FoodManufacturer> = {
    foodManufacturerId: 1,
    foodManufacturerName: 'Test FM',
  };

  const mockOrders: Partial<Order>[] = [
    {
      orderId: 1,
      status: OrderStatus.PENDING,
      request: mockRequests[0] as FoodRequest,
      foodManufacturer: mockFoodManufacturer as FoodManufacturer,
    },
    {
      orderId: 2,
      status: OrderStatus.DELIVERED,
      request: mockRequests[1] as FoodRequest,
      foodManufacturer: mockFoodManufacturer as FoodManufacturer,
    },
    {
      orderId: 3,
      status: OrderStatus.SHIPPED,
      request: mockRequests[2] as FoodRequest,
      foodManufacturer: mockFoodManufacturer as FoodManufacturer,
    },
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

  describe('getCurrentOrders', () => {
    it('should call ordersService.getCurrentOrders and return orders', async () => {
      mockOrdersService.getCurrentOrders.mockResolvedValueOnce([
        mockOrders[0],
        mockOrders[2],
      ] as Order[]);

      const result = await controller.getCurrentOrders();

      expect(result).toEqual([mockOrders[0], mockOrders[2]] as Order[]);
      expect(mockOrdersService.getCurrentOrders).toHaveBeenCalled();
    });
  });

  describe('getPastOrders', () => {
    it('should call ordersService.getPastOrders and return orders', async () => {
      mockOrdersService.getPastOrders.mockResolvedValueOnce([
        mockOrders[1],
      ] as Order[]);

      const result = await controller.getPastOrders();

      expect(result).toEqual([mockOrders[1]] as Order[]);
      expect(mockOrdersService.getPastOrders).toHaveBeenCalled();
    });
  });

  describe('getPantryFromOrder', () => {
    it('should call ordersService.findOrderPantry and return pantry', async () => {
      const orderId = 1;
      mockOrdersService.findOrderPantry.mockResolvedValueOnce(
        mockPantries[0] as Pantry,
      );

      const result = await controller.getPantryFromOrder(orderId);

      expect(result).toEqual(mockPantries[0] as Pantry);
      expect(mockOrdersService.findOrderPantry).toHaveBeenCalledWith(orderId);
    });

    it('should propagate NotFoundException when request not found', async () => {
      const orderId = 999;
      mockOrdersService.findOrderPantry.mockRejectedValueOnce(
        new NotFoundException(`Request for order ${orderId} not found`),
      );

      const promise = controller.getPantryFromOrder(orderId);
      await expect(promise).rejects.toBeInstanceOf(NotFoundException);
      await expect(promise).rejects.toThrow(
        `Request for order ${orderId} not found`,
      );
      expect(mockOrdersService.findOrderPantry).toHaveBeenCalledWith(orderId);
    });
  });

  describe('getRequestFromOrder', () => {
    it('should call ordersService.findOrderFoodRequest and return food request', async () => {
      const orderId = 1;
      mockOrdersService.findOrderFoodRequest.mockResolvedValueOnce(
        mockRequests[0] as FoodRequest,
      );

      const result = await controller.getRequestFromOrder(orderId);

      expect(result).toEqual(mockRequests[0] as Pantry);
      expect(mockOrdersService.findOrderFoodRequest).toHaveBeenCalledWith(
        orderId,
      );
    });

    it('should propagate NotFoundException when order not found', async () => {
      const orderId = 999;
      mockOrdersService.findOrderFoodRequest.mockRejectedValueOnce(
        new NotFoundException(`Order ${orderId} not found`),
      );

      const promise = controller.getRequestFromOrder(orderId);
      await expect(promise).rejects.toBeInstanceOf(NotFoundException);
      await expect(promise).rejects.toThrow(`Order ${orderId} not found`);
      expect(mockOrdersService.findOrderFoodRequest).toHaveBeenCalledWith(
        orderId,
      );
    });
  });

  describe('getManufacturerFromOrder', () => {
    it('should call ordersService.findOrderFoodManufacturer and return FM', async () => {
      const orderId = 1;
      mockOrdersService.findOrderFoodManufacturer.mockResolvedValueOnce(
        mockFoodManufacturer as FoodManufacturer,
      );

      const result = await controller.getManufacturerFromOrder(orderId);

      expect(result).toEqual(mockFoodManufacturer as FoodManufacturer);
      expect(mockOrdersService.findOrderFoodManufacturer).toHaveBeenCalledWith(
        orderId,
      );
    });

    it('should propagate NotFoundException when order not found', async () => {
      const orderId = 999;
      mockOrdersService.findOrderFoodManufacturer.mockRejectedValueOnce(
        new NotFoundException(`Order ${orderId} not found`),
      );

      const promise = controller.getManufacturerFromOrder(orderId);
      await expect(promise).rejects.toBeInstanceOf(NotFoundException);
      await expect(promise).rejects.toThrow(`Order ${orderId} not found`);
      expect(mockOrdersService.findOrderFoodManufacturer).toHaveBeenCalledWith(
        orderId,
      );
    });
  });

  describe('getOrder', () => {
    it('should call ordersService.findOne and return order', async () => {
      const orderId = 1;
      mockOrdersService.findOne.mockResolvedValueOnce(mockOrders[0] as Order);

      const result = await controller.getOrder(orderId);

      expect(result).toEqual(mockOrders[0] as Order);
      expect(mockOrdersService.findOne).toHaveBeenCalledWith(orderId);
    });

    it('should propagate NotFoundException when order not found', async () => {
      const orderId = 999;
      mockOrdersService.findOne.mockRejectedValueOnce(
        new NotFoundException(`Order ${orderId} not found`),
      );

      const promise = controller.getOrder(orderId);
      await expect(promise).rejects.toBeInstanceOf(NotFoundException);
      await expect(promise).rejects.toThrow(`Order ${orderId} not found`);
      expect(mockOrdersService.findOne).toHaveBeenCalledWith(orderId);
    });
  });

  describe('getOrderByRequestId', () => {
    it('should call ordersService.findOrderByRequest and return order', async () => {
      const requestId = 1;
      mockOrdersService.findOrderByRequest.mockResolvedValueOnce(
        mockOrders[0] as Order,
      );

      const result = await controller.getOrderByRequestId(requestId);

      expect(result).toEqual(mockOrders[0] as Order);
      expect(mockOrdersService.findOrderByRequest).toHaveBeenCalledWith(
        requestId,
      );
    });

    it('should propagate NotFoundException when order not found', async () => {
      const requestId = 999;
      mockOrdersService.findOrderByRequest.mockRejectedValueOnce(
        new NotFoundException(`Order with request ID ${requestId} not found`),
      );

      const promise = controller.getOrderByRequestId(requestId);
      await expect(promise).rejects.toBeInstanceOf(NotFoundException);
      await expect(promise).rejects.toThrow(
        `Order with request ID ${requestId} not found`,
      );
      expect(mockOrdersService.findOrderByRequest).toHaveBeenCalledWith(
        requestId,
      );
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

  describe('updateStatus', () => {
    it('should call ordersService.updateStatus', async () => {
      const status = OrderStatus.DELIVERED;
      const orderId = 1;

      await controller.updateStatus(orderId, status);

      expect(mockOrdersService.updateStatus).toHaveBeenCalledWith(
        orderId,
        status,
      );
    });

    it('should throw with invalid status', async () => {
      const invalidStatus = 'invalid status';
      const orderId = 1;

      await expect(
        controller.updateStatus(orderId, invalidStatus),
      ).rejects.toThrow(new BadRequestException('Invalid status'));
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

    it('should propagate BadRequestException when neither tracking link nor shipping cost is provided', async () => {
      const orderId = 1;

      mockOrdersService.updateTrackingCostInfo.mockRejectedValueOnce(
        new BadRequestException(
          'At least one of tracking link or shipping cost must be provided',
        ),
      );

      const promise = controller.updateTrackingCostInfo(orderId, {});
      await expect(promise).rejects.toBeInstanceOf(BadRequestException);
      await expect(promise).rejects.toThrow(
        'At least one of tracking link or shipping cost must be provided',
      );
      expect(mockOrdersService.updateTrackingCostInfo).toHaveBeenCalledWith(
        orderId,
        {},
      );
    });

    it('should propagate NotFoundException when order not found', async () => {
      const orderId = 999;
      const trackingLink = 'www.samplelink/samplelink';
      const shippingCost = 15.99;
      const dto: TrackingCostDto = { trackingLink, shippingCost };

      mockOrdersService.updateTrackingCostInfo.mockRejectedValueOnce(
        new NotFoundException(`Order ${orderId} not found`),
      );

      const promise = controller.updateTrackingCostInfo(orderId, dto);
      await expect(promise).rejects.toBeInstanceOf(NotFoundException);
      await expect(promise).rejects.toThrow(`Order ${orderId} not found`);
      expect(mockOrdersService.updateTrackingCostInfo).toHaveBeenCalledWith(
        orderId,
        dto,
      );
    });

    it('should propagate BadRequestException for delivered order', async () => {
      const dto: TrackingCostDto = {
        trackingLink: 'testtracking.com',
        shippingCost: 7.5,
      };
      const orderId = 2;

      mockOrdersService.updateTrackingCostInfo.mockRejectedValueOnce(
        new BadRequestException(
          'Can only update tracking info for pending or shipped orders',
        ),
      );

      const promise = controller.updateTrackingCostInfo(orderId, dto);
      await expect(promise).rejects.toBeInstanceOf(BadRequestException);
      await expect(promise).rejects.toThrow(
        'Can only update tracking info for pending or shipped orders',
      );
      expect(mockOrdersService.updateTrackingCostInfo).toHaveBeenCalledWith(
        orderId,
        dto,
      );
    });

    it('throws when both fields are not provided for first time setting', async () => {
      const dto: TrackingCostDto = {
        trackingLink: 'testtracking.com',
      };
      const orderId = 4;

      mockOrdersService.updateTrackingCostInfo.mockRejectedValueOnce(
        new BadRequestException(
          'Must provide both tracking link and shipping cost on initial assignment',
        ),
      );

      const promise = controller.updateTrackingCostInfo(orderId, dto);
      await expect(promise).rejects.toBeInstanceOf(BadRequestException);
      await expect(promise).rejects.toThrow(
        'Must provide both tracking link and shipping cost on initial assignment',
      );
      expect(mockOrdersService.updateTrackingCostInfo).toHaveBeenCalledWith(
        orderId,
        dto,
      );
    });
  });
});
