import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from './order.controller';
import { OrdersService } from './order.service';
import { AllocationsService } from '../allocations/allocations.service';
import { Order } from './order.entity';
import { Allocation } from '../allocations/allocations.entity';
import { mock } from 'jest-mock-extended';
import { OrderStatus, VolunteerAction } from './types';
import { FoodRequest } from '../foodRequests/request.entity';
import { Pantry } from '../pantries/pantries.entity';
import { AWSS3Service } from '../aws/aws-s3.service';
import { TrackingCostDto } from './dtos/tracking-cost.dto';
import { BulkUpdateTrackingCostDto } from './dtos/bulk-update-tracking-cost.dto';
import { OrderDetailsDto } from './dtos/order-details.dto';
import { FoodType } from '../donationItems/types';
import { BadRequestException } from '@nestjs/common';
import { FoodManufacturer } from '../foodManufacturers/manufacturers.entity';
import { FoodRequestSummaryDto } from '../foodRequests/dtos/food-request-summary.dto';
import { ConfirmDeliveryDto } from './dtos/confirm-delivery.dto';
import { CreateOrderDto } from './dtos/create-order.dto';
import { AuthenticatedRequest } from '../auth/authenticated-request';
import { CompleteVolunteerActionDto } from './dtos/complete-volunteer-action.dto';

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

  const mockRequestSummary: Partial<FoodRequestSummaryDto> = {
    requestId: 4,
    pantry: { pantryId: 1, pantryName: 'Example Pantry' },
  };

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

  const mockOrderDetails: Partial<OrderDetailsDto> = {
    orderId: 1,
    status: OrderStatus.DELIVERED,
    foodManufacturerName: 'food manufacturer 1',
    trackingLink: 'example-link.com',
    items: [
      {
        id: 1,
        name: 'item1',
        quantity: 10,
        foodType: FoodType.DAIRY_FREE_ALTERNATIVES,
      },
    ],
  };

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

  describe('getOrder', () => {
    it('should call ordersService.findOrderDetails and return order details', async () => {
      mockOrdersService.findOrderDetails.mockResolvedValueOnce(
        mockOrderDetails as OrderDetailsDto,
      );

      const orderId = 1;

      const result = await controller.getOrder(orderId);

      expect(result).toEqual(mockOrderDetails as OrderDetailsDto);
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
  });

  describe('getRequestFromOrder', () => {
    it('should call ordersService.findOrderFoodRequest and return food request', async () => {
      const orderId = 1;
      mockOrdersService.findOrderFoodRequest.mockResolvedValueOnce(
        mockRequestSummary as FoodRequestSummaryDto,
      );

      const result = await controller.getRequestFromOrder(orderId);

      expect(result).toEqual(mockRequestSummary as FoodRequestSummaryDto);
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
      const body: ConfirmDeliveryDto = {
        dateReceived: new Date().toISOString(),
        feedback: 'Great delivery!',
      };
      const mockFiles: Express.Multer.File[] = [
        {
          fieldname: 'photos',
          originalname: 'photo1.jpg',
          encoding: '7bit',
          mimetype: 'image/jpeg',
          buffer: Buffer.from('photo1'),
          size: 1000,
        } as Express.Multer.File,
      ];

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
        body,
        uploadedUrls,
      );
      expect(result).toEqual(confirmedOrder);
    });

    it('should handle no photos being uploaded', async () => {
      const orderId = 2;
      const body: ConfirmDeliveryDto = {
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
        body,
        [],
      );
      expect(result).toEqual(confirmedOrder);
    });

    it('should handle empty photos array', async () => {
      const orderId = 3;
      const body: ConfirmDeliveryDto = {
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
        body,
        [],
      );
      expect(result).toEqual(confirmedOrder);
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
  });

  describe('bulkUpdateTrackingCostInfo', () => {
    it('should call ordersService.bulkUpdateTrackingCostInfo with correct parameters', async () => {
      const dto: BulkUpdateTrackingCostDto = {
        donationId: 1,
        orders: [
          {
            orderId: 4,
            trackingLink: 'https://tracking.example.com',
            shippingCost: 15.99,
          },
        ],
      };

      await controller.bulkUpdateTrackingCostInfo(dto);

      expect(mockOrdersService.bulkUpdateTrackingCostInfo).toHaveBeenCalledWith(
        dto,
      );
    });
  });

  describe('createOrder', () => {
    const req = { user: { id: 3 } };

    it('should call ordersService.create and return the created order', async () => {
      const createOrderDto = {
        foodRequestId: 1,
        manufacturerId: 1,
        itemAllocations: {
          5: 10,
          8: 3,
          12: 7,
        },
      };

      const itemAllocationsMap = new Map<number, number>([
        [5, 10],
        [8, 3],
        [12, 7],
      ]);

      const mockCreatedOrder: Partial<Order> = {
        orderId: 42,
        status: OrderStatus.PENDING,
        request: { requestId: 1 } as FoodRequest,
        foodManufacturer: { foodManufacturerId: 1 } as FoodManufacturer,
      };

      mockOrdersService.create.mockResolvedValueOnce(mockCreatedOrder as Order);

      const result = await controller.createOrder(
        req as AuthenticatedRequest,
        createOrderDto,
      );

      expect(mockOrdersService.create).toHaveBeenCalledWith(
        createOrderDto.foodRequestId,
        createOrderDto.manufacturerId,
        itemAllocationsMap,
        3,
      );
      expect(result).toEqual(mockCreatedOrder);
    });

    it('should throw BadRequestException for invalid item ID', async () => {
      const createOrderDto: CreateOrderDto = {
        foodRequestId: 1,
        manufacturerId: 1,
        itemAllocations: { abc: 10 },
      };

      await expect(
        controller.createOrder(req as AuthenticatedRequest, createOrderDto),
      ).rejects.toThrow(new BadRequestException('Invalid item ID: abc'));
    });

    it('should throw BadRequestException for duplicate item IDs', async () => {
      const createOrderDto: CreateOrderDto = {
        foodRequestId: 1,
        manufacturerId: 1,
        itemAllocations: { '1': 2, '1.0': 3 },
      };

      await expect(
        controller.createOrder(req as AuthenticatedRequest, createOrderDto),
      ).rejects.toThrow(
        new BadRequestException('Invalid duplicate item IDs for item: 1'),
      );
    });

    it('should throw BadRequestException for invalid item quantity type', async () => {
      const createOrderDto: CreateOrderDto = {
        foodRequestId: 1,
        manufacturerId: 1,
        itemAllocations: { 5: '10' },
      };

      await expect(
        controller.createOrder(req as AuthenticatedRequest, createOrderDto),
      ).rejects.toThrow(
        new BadRequestException('Quantity for item 5 must be of type number'),
      );
    });

    it('should throw BadRequestException for quantity invalid quantity', async () => {
      const createOrderDto: CreateOrderDto = {
        foodRequestId: 1,
        manufacturerId: 1,
        itemAllocations: { 5: 0 },
      };

      await expect(
        controller.createOrder(req as AuthenticatedRequest, createOrderDto),
      ).rejects.toThrow(new BadRequestException('Invalid quantity for item 5'));
    });

    it('should throw BadRequestException for quantity invalid quantity (decimal)', async () => {
      const createOrderDto: CreateOrderDto = {
        foodRequestId: 1,
        manufacturerId: 1,
        itemAllocations: { 5: 2.2 },
      };

      await expect(
        controller.createOrder(req as AuthenticatedRequest, createOrderDto),
      ).rejects.toThrow(new BadRequestException('Invalid quantity for item 5'));
    });

    it('should propagate BadRequestException when request is not active', async () => {
      const foodRequestId = 1;

      const createOrderDto: CreateOrderDto = {
        foodRequestId: foodRequestId,
        manufacturerId: 1,
        itemAllocations: { 5: 10 },
      };

      const itemAllocationsMap = new Map<number, number>([[5, 10]]);

      mockOrdersService.create.mockRejectedValueOnce(
        new BadRequestException(`Request ${foodRequestId} is not active`),
      );

      const promise = controller.createOrder(
        req as AuthenticatedRequest,
        createOrderDto,
      );
      await expect(promise).rejects.toBeInstanceOf(BadRequestException);
      await expect(promise).rejects.toThrow(
        `Request ${foodRequestId} is not active`,
      );
      expect(mockOrdersService.create).toHaveBeenCalledWith(
        createOrderDto.foodRequestId,
        createOrderDto.manufacturerId,
        itemAllocationsMap,
        3,
      );
    });

    it('should propagate Error when donation item does not belong to FM', async () => {
      const createOrderDto: CreateOrderDto = {
        foodRequestId: 1,
        manufacturerId: 1,
        itemAllocations: { 5: 10 },
      };

      const itemAllocationsMap = new Map<number, number>([[5, 10]]);

      mockOrdersService.create.mockRejectedValueOnce(
        new BadRequestException(
          `Donation is not associated with the current food manufacturer`,
        ),
      );

      const promise = controller.createOrder(
        req as AuthenticatedRequest,
        createOrderDto,
      );
      await expect(promise).rejects.toThrow(BadRequestException);
      await expect(promise).rejects.toThrow(
        `Donation is not associated with the current food manufacturer`,
      );
      expect(mockOrdersService.create).toHaveBeenCalledWith(
        createOrderDto.foodRequestId,
        createOrderDto.manufacturerId,
        itemAllocationsMap,
        3,
      );
    });

    it('should propagate BadRequestException when allocated quantity exceeds remaining', async () => {
      const donationItemId = 5;

      const createOrderDto: CreateOrderDto = {
        foodRequestId: 1,
        manufacturerId: 1,
        itemAllocations: { [donationItemId]: 100 },
      };

      const itemAllocationsMap = new Map<number, number>([
        [donationItemId, 100],
      ]);

      mockOrdersService.create.mockRejectedValueOnce(
        new BadRequestException(
          `Donation item ${donationItemId} allocated quantity exceeds remaining quantity`,
        ),
      );

      const promise = controller.createOrder(
        req as AuthenticatedRequest,
        createOrderDto,
      );
      await expect(promise).rejects.toBeInstanceOf(BadRequestException);
      await expect(promise).rejects.toThrow(
        `Donation item ${donationItemId} allocated quantity exceeds remaining quantity`,
      );
      expect(mockOrdersService.create).toHaveBeenCalledWith(
        createOrderDto.foodRequestId,
        createOrderDto.manufacturerId,
        itemAllocationsMap,
        3,
      );
    });
  });

  describe('completeVolunteerAction', () => {
    it('should call ordersService.completeVolunteerAction with correct parameters', async () => {
      const orderId = 1;
      const dto: CompleteVolunteerActionDto = {
        action: VolunteerAction.CONFIRM_DONATION_RECEIPT,
      };

      const updatedOrder = {
        ...mockOrders[0],
        confirmDonationReceipt: true,
      };
      mockOrdersService.completeVolunteerAction.mockResolvedValueOnce(
        updatedOrder as Order,
      );

      const result = await controller.completeVolunteerAction(orderId, dto);

      expect(mockOrdersService.completeVolunteerAction).toHaveBeenCalledWith(
        orderId,
        VolunteerAction.CONFIRM_DONATION_RECEIPT,
      );
      expect(result).toEqual(updatedOrder);
    });
  });
});
