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
import { AWSS3Service } from '../aws/aws-s3.service';

const mockOrdersService = mock<OrdersService>();
const mockAllocationsService = mock<AllocationsService>();
const mockAWSS3Service = mock<AWSS3Service>();

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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        { provide: OrdersService, useValue: mockOrdersService },
        { provide: AllocationsService, useValue: mockAllocationsService },
        { provide: AWSS3Service, useValue: mockAWSS3Service },
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

  describe('confirmDelivery', () => {
    beforeEach(() => {
      mockAWSS3Service.upload.mockReset();
      mockOrdersService.confirmDelivery.mockReset();
    });

    it('should upload photos and confirm delivery with all fields', async () => {
      const orderId = 1;
      const body = {
        dateReceived: new Date().toISOString(),
        feedback: 'Great delivery!',
      };
      const mockFiles = [
        {
          fieldname: 'photos',
          originalname: 'photo1.jpg',
          encoding: '7bit',
          mimetype: 'image/jpeg',
          buffer: Buffer.from('photo1'),
          size: 1000,
        },
      ] as Express.Multer.File[];

      const uploadedUrls = ['https://s3.example.com/photo1.jpg'];
      mockAWSS3Service.upload.mockResolvedValueOnce(uploadedUrls);

      const confirmedOrder: Partial<Order> = {
        orderId,
        status: OrderStatus.DELIVERED,
        dateReceived: new Date(body.dateReceived),
        feedback: body.feedback,
        photos: uploadedUrls,
      };
      mockOrdersService.confirmDelivery.mockResolvedValueOnce(
        confirmedOrder as Order,
      );

      const result = await controller.confirmDelivery(orderId, body, mockFiles);

      expect(mockAWSS3Service.upload).toHaveBeenCalledWith(mockFiles);
      expect(mockOrdersService.confirmDelivery).toHaveBeenCalledWith(
        orderId,
        new Date(body.dateReceived),
        body.feedback,
        uploadedUrls,
      );
      expect(result).toEqual(confirmedOrder);
    });

    it('should handle no photos being uploaded', async () => {
      const orderId = 2;
      const body = {
        dateReceived: new Date().toISOString(),
        feedback: 'Delivery without photos',
      };

      const confirmedOrder: Partial<Order> = {
        orderId,
        status: OrderStatus.DELIVERED,
        dateReceived: new Date(body.dateReceived),
        feedback: body.feedback,
        photos: [],
      };
      mockOrdersService.confirmDelivery.mockResolvedValueOnce(
        confirmedOrder as Order,
      );

      const result = await controller.confirmDelivery(orderId, body);

      expect(mockAWSS3Service.upload).not.toHaveBeenCalled();
      expect(mockOrdersService.confirmDelivery).toHaveBeenCalledWith(
        orderId,
        new Date(body.dateReceived),
        body.feedback,
        [],
      );
      expect(result).toEqual(confirmedOrder);
    });

    it('should handle empty photos array', async () => {
      const orderId = 3;
      const body = {
        dateReceived: new Date().toISOString(),
        feedback: 'Empty photos',
      };

      const confirmedOrder: Partial<Order> = {
        orderId,
        status: OrderStatus.DELIVERED,
        dateReceived: new Date(body.dateReceived),
        feedback: body.feedback,
        photos: [],
      };
      mockOrdersService.confirmDelivery.mockResolvedValueOnce(
        confirmedOrder as Order,
      );

      const result = await controller.confirmDelivery(orderId, body, []);

      expect(mockAWSS3Service.upload).not.toHaveBeenCalled();
      expect(mockOrdersService.confirmDelivery).toHaveBeenCalledWith(
        orderId,
        new Date(body.dateReceived),
        body.feedback,
        [],
      );
      expect(result).toEqual(confirmedOrder);
    });

    it('should throw BadRequestException for invalid date format', async () => {
      const orderId = 1;
      const body = {
        dateReceived: 'invalid-date',
        feedback: 'test',
      };

      await expect(controller.confirmDelivery(orderId, body)).rejects.toThrow(
        'Invalid date format for dateReceived',
      );

      expect(mockAWSS3Service.upload).not.toHaveBeenCalled();
      expect(mockOrdersService.confirmDelivery).not.toHaveBeenCalled();
    });
  });
});
