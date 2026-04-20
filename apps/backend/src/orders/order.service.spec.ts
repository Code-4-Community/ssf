import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { OrdersService } from './order.service';
import { Order } from './order.entity';
import { testDataSource } from '../config/typeormTestDataSource';
import { OrderStatus, VolunteerAction } from './types';
import { Pantry } from '../pantries/pantries.entity';
import { OrderDetailsDto } from './dtos/order-details.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TrackingCostDto } from './dtos/tracking-cost.dto';
import { FoodType } from '../donationItems/types';
import { FoodRequest } from '../foodRequests/request.entity';
import 'multer';
import { FoodRequestStatus } from '../foodRequests/types';
import { RequestsService } from '../foodRequests/request.service';
import { FoodManufacturersService } from '../foodManufacturers/manufacturers.service';
import { DonationItemsService } from '../donationItems/donationItems.service';
import { AllocationsService } from '../allocations/allocations.service';
import { FoodManufacturer } from '../foodManufacturers/manufacturers.entity';
import { UsersService } from '../users/users.service';
import { DonationItem } from '../donationItems/donationItems.entity';
import { Donation } from '../donations/donations.entity';
import { User } from '../users/users.entity';
import { AuthService } from '../auth/auth.service';
import { DonationService } from '../donations/donations.service';
import { CreateOrderDto } from './dtos/create-order.dto';
import { DonationStatus } from '../donations/types';
import { DataSource } from 'typeorm';
import { EmailsService } from '../emails/email.service';
import { Allocation } from '../allocations/allocations.entity';
import { mock } from 'jest-mock-extended';

// Set 1 minute timeout for async DB operations
jest.setTimeout(60000);

const mockEmailsService = mock<EmailsService>();

describe('OrdersService', () => {
  let service: OrdersService;

  beforeAll(async () => {
    mockEmailsService.sendEmails.mockResolvedValue(undefined);

    // Initialize DataSource once
    if (!testDataSource.isInitialized) {
      await testDataSource.initialize();
    }

    // Clean database at the start
    await testDataSource.query(`DROP SCHEMA IF EXISTS public CASCADE`);
    await testDataSource.query(`CREATE SCHEMA public`);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        RequestsService,
        FoodManufacturersService,
        DonationItemsService,
        AllocationsService,
        UsersService,
        DonationService,
        EmailsService,
        {
          provide: DataSource,
          useValue: testDataSource,
        },
        {
          provide: EmailsService,
          useValue: {
            sendEmails: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: getRepositoryToken(Order),
          useValue: testDataSource.getRepository(Order),
        },
        {
          provide: getRepositoryToken(FoodManufacturer),
          useValue: testDataSource.getRepository(FoodManufacturer),
        },
        {
          provide: getRepositoryToken(Pantry),
          useValue: testDataSource.getRepository(Pantry),
        },
        {
          provide: getRepositoryToken(FoodRequest),
          useValue: testDataSource.getRepository(FoodRequest),
        },
        {
          provide: getRepositoryToken(DonationItem),
          useValue: testDataSource.getRepository(DonationItem),
        },
        {
          provide: getRepositoryToken(Donation),
          useValue: testDataSource.getRepository(Donation),
        },
        {
          provide: getRepositoryToken(Allocation),
          useValue: testDataSource.getRepository(Allocation),
        },
        {
          provide: getRepositoryToken(User),
          useValue: testDataSource.getRepository(User),
        },
        {
          provide: AuthService,
          useValue: {},
        },
        {
          provide: EmailsService,
          useValue: mockEmailsService,
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  beforeEach(async () => {
    mockEmailsService.sendEmails.mockClear();
    await testDataSource.query(`DROP SCHEMA IF EXISTS public CASCADE`);
    await testDataSource.query(`CREATE SCHEMA public`);
    await testDataSource.runMigrations();
  });

  afterEach(async () => {
    // Drop the schema completely (cascades all tables)
    await testDataSource.query(`DROP SCHEMA public CASCADE`);
    await testDataSource.query(`CREATE SCHEMA public`);
  });

  afterAll(async () => {
    // Destroy all schemas
    if (testDataSource.isInitialized) {
      await testDataSource.destroy();
    }
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAll', () => {
    it('returns orders filtered by status', async () => {
      const orders = await service.getAll({ status: OrderStatus.DELIVERED });

      expect(orders).toHaveLength(2);
      expect(
        orders.every((order) => order.status === OrderStatus.DELIVERED),
      ).toBe(true);
    });

    it('returns empty array when status filter matches nothing', async () => {
      // Delete allocations referencing pending orders, then delete orders themselves
      await testDataSource.query(
        `DELETE FROM "allocations" WHERE order_id IN (SELECT order_id FROM "orders" WHERE status = $1)`,
        [OrderStatus.PENDING],
      );
      await testDataSource.query(`DELETE FROM "orders" WHERE status = $1`, [
        OrderStatus.PENDING,
      ]);

      const orders = await service.getAll({ status: OrderStatus.PENDING });
      expect(orders).toEqual([]);
    });

    it('returns orders filtered by pantry names', async () => {
      const orders = await service.getAll({
        pantryNames: ['Community Food Pantry Downtown'],
      });

      expect(orders).toHaveLength(2);
      expect(
        orders.every(
          (order) =>
            order.request.pantry.pantryName ===
            'Community Food Pantry Downtown',
        ),
      ).toBe(true);
    });

    it('returns empty array when pantry filter matches nothing', async () => {
      const orders = await service.getAll({
        pantryNames: ['Nonexistent Pantry'],
      });

      expect(orders).toEqual([]);
    });

    it('returns orders filtered by both pantry and status', async () => {
      const orders = await service.getAll({
        status: OrderStatus.DELIVERED,
        pantryNames: ['Westside Community Kitchen'],
      });

      expect(orders).toHaveLength(1);
      expect(orders[0].request.pantry.pantryName).toBe(
        'Westside Community Kitchen',
      );
      expect(orders[0].status).toBe(OrderStatus.DELIVERED);
    });
  });

  describe('findOrderDetails', () => {
    it('returns mapped OrderDetailsDto including allocations and manufacturer', async () => {
      const orderId = 1;

      const result = await service.findOrderDetails(orderId);

      const expected: OrderDetailsDto = {
        orderId: 1,
        status: OrderStatus.DELIVERED,
        foodManufacturerName: 'FoodCorp Industries',
        trackingLink: 'https://www.samplelink.com/samplelink',
        items: [
          {
            id: 1,
            foodType: FoodType.SEED_BUTTERS,
            name: 'Peanut Butter (16oz)',
            quantity: 10,
          },
          {
            id: 2,
            foodType: FoodType.GLUTEN_FREE_BREAD,
            name: 'Whole Wheat Bread',
            quantity: 25,
          },
          {
            id: 3,
            foodType: FoodType.REFRIGERATED_MEALS,
            name: 'Canned Green Beans',
            quantity: 5,
          },
        ],
      };

      expect(result).toMatchObject({
        orderId: expected.orderId,
        status: expected.status,
        foodManufacturerName: expected.foodManufacturerName,
        trackingLink: expected.trackingLink,
      });

      expect(result.items).toHaveLength(expected.items.length);
      expect(result.items).toEqual(expect.arrayContaining(expected.items));
    });

    it('throws NotFoundException when order does not exist', async () => {
      const missingOrderId = 99999999;

      await expect(service.findOrderDetails(missingOrderId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOrderDetails(missingOrderId)).rejects.toThrow(
        `Order ${missingOrderId} not found`,
      );
    });
  });

  describe('getCurrentOrders', () => {
    it(`returns only orders with status 'pending' or 'shipped'`, async () => {
      const orders = await service.getCurrentOrders();
      expect(orders).toHaveLength(2);
      expect(
        orders.every(
          (order) =>
            order.status === OrderStatus.PENDING ||
            order.status === OrderStatus.SHIPPED,
        ),
      ).toBe(true);
    });
  });

  describe('getPastOrders', () => {
    it(`returns only orders with status 'delivered'`, async () => {
      const orders = await service.getPastOrders();
      expect(orders).toHaveLength(2);
      expect(
        orders.every((order) => order.status === OrderStatus.DELIVERED),
      ).toBe(true);
    });
  });

  describe('findOne', () => {
    it('returns order by ID', async () => {
      const orderId = 1;
      const result = await service.findOne(orderId);

      expect(result).toBeDefined();
      expect(result.orderId).toBe(1);
    });

    it('throws NotFoundException for non-existent order', async () => {
      await expect(service.findOne(9999)).rejects.toThrow(
        new NotFoundException('Order 9999 not found'),
      );
    });
  });

  describe('findOrderByRequest', () => {
    it('returns order by request ID', async () => {
      const order = await service.findOrderByRequest(1);

      expect(order).toBeDefined();
      expect(order.request).toBeDefined();
      expect(order.requestId).toBe(1);
    });

    it('throws NotFoundException for non-existent order', async () => {
      await expect(service.findOrderByRequest(9999)).rejects.toThrow(
        new NotFoundException('Order with request ID 9999 not found'),
      );
    });
  });

  describe('findOrderFoodRequest', () => {
    it('returns food request of order', async () => {
      const foodRequest = await service.findOrderFoodRequest(1);

      expect(foodRequest).toBeDefined();
      expect(foodRequest.requestId).toBe(1);
    });

    it('throws NotFoundException for non-existent order', async () => {
      await expect(service.findOrderFoodRequest(9999)).rejects.toThrow(
        new NotFoundException('Order 9999 not found'),
      );
    });
  });

  describe('findOrderPantry', () => {
    it('returns pantry of order', async () => {
      const pantry = await service.findOrderPantry(1);

      expect(pantry).toBeDefined();
      expect(pantry.pantryName).toEqual('Community Food Pantry Downtown');
      expect(pantry.pantryId).toEqual(1);
    });
  });

  describe('findOrderFoodManufacturer', () => {
    it('returns FM of order', async () => {
      const foodManufacturer = await service.findOrderFoodManufacturer(2);

      expect(foodManufacturer).toBeDefined();
      expect(foodManufacturer.foodManufacturerName).toEqual('Healthy Foods Co');
      expect(foodManufacturer.foodManufacturerId).toEqual(2);
    });

    it('throws NotFoundException for non-existent order', async () => {
      await expect(service.findOrderFoodManufacturer(9999)).rejects.toThrow(
        new NotFoundException('Order 9999 not found'),
      );
    });
  });

  describe('updateStatus', () => {
    it('updates order status to delivered', async () => {
      const orderId = 3;
      const order = await service.findOne(orderId);

      expect(order.status).toEqual(OrderStatus.SHIPPED);
      expect(order.shippedAt).toBeDefined();

      await service.updateStatus(orderId, OrderStatus.DELIVERED);
      const updatedOrder = await service.findOne(orderId);

      expect(updatedOrder.status).toEqual(OrderStatus.DELIVERED);
      expect(updatedOrder.deliveredAt).toBeDefined();
    });

    it('updates order status to shipped', async () => {
      const orderId = 4;
      const order = await service.findOne(orderId);

      expect(order.status).toEqual(OrderStatus.PENDING);

      await service.updateStatus(orderId, OrderStatus.SHIPPED);
      const updatedOrder = await service.findOne(orderId);

      expect(updatedOrder.status).toEqual(OrderStatus.SHIPPED);
      expect(updatedOrder.shippedAt).toBeDefined();
      expect(updatedOrder.deliveredAt).toBeNull();
    });
  });

  describe('getOrdersByPantry', () => {
    it('returns order from pantry ID', async () => {
      const pantryId = 1;
      const orders = await service.getOrdersByPantry(pantryId);

      expect(orders.length).toBe(2);
      expect(orders.every((order) => order.request)).toBeDefined();
      expect(orders.every((order) => order.request.pantryId === 1)).toBe(true);
    });

    it('returns empty list for pantry with no orderes', async () => {
      const pantryId = 5;
      const orders = await service.getOrdersByPantry(pantryId);

      expect(orders).toEqual([]);
    });

    it('honors year filter (no results for future year)', async () => {
      const pantryId = 1;
      const orders = await service.getOrdersByPantry(pantryId, [2025]);
      expect(orders).toEqual([]);
    });

    it('returns orders when a valid year filter is provided', async () => {
      const pantryId = 1;

      // Change some order dates so we have 2024, 2025 and 2026 values
      await testDataSource.query(
        `UPDATE "orders" SET created_at='2025-01-01' WHERE order_id = 1`,
      );
      await testDataSource.query(
        `UPDATE "orders" SET created_at='2026-01-01' WHERE order_id = 2`,
      );

      const orders = await service.getOrdersByPantry(pantryId, [2024, 2025]);
      expect(orders.length).toBeGreaterThan(0);

      const years = orders.map((o) => new Date(o.createdAt).getFullYear());
      expect(years).toContain(2025);
      expect(years.every((y) => y === 2024 || y === 2025)).toBe(true);
    });

    it('throws NotFoundException for non-existent pantry', async () => {
      const pantryId = 9999;

      await expect(service.getOrdersByPantry(pantryId)).rejects.toThrow(
        new NotFoundException(`Pantry ${pantryId} not found`),
      );
    });
  });

  describe('updateTrackingCostInfo', () => {
    it('throws when order is non-existent', async () => {
      const trackingCostDto: TrackingCostDto = {
        trackingLink: 'www.test.com',
        shippingCost: 5.99,
      };

      await expect(
        service.updateTrackingCostInfo(9999, trackingCostDto),
      ).rejects.toThrow(new NotFoundException('Order 9999 not found'));
    });

    it('throws when tracking link and shipping cost not given', async () => {
      await expect(service.updateTrackingCostInfo(3, {})).rejects.toThrow(
        new BadRequestException(
          'At least one of tracking link or shipping cost must be provided',
        ),
      );
    });

    it('sanitizes and updates tracking link for shipped order', async () => {
      const trackingCostDto: TrackingCostDto = {
        trackingLink: 'samplelink.com',
      };

      await service.updateTrackingCostInfo(3, trackingCostDto);

      const order = await service.findOne(3);
      expect(order.trackingLink).toBeDefined();
      expect(order.trackingLink).toEqual('https://samplelink.com/');
    });

    it('updates shipping cost for shipped order', async () => {
      const trackingCostDto: TrackingCostDto = {
        shippingCost: 12.99,
      };

      await service.updateTrackingCostInfo(3, trackingCostDto);

      const order = await service.findOne(3);
      expect(order.shippingCost).toBeDefined();
      expect(order.shippingCost).toEqual(12.99);
    });

    it('updates both shipping cost and tracking link (sanitized)', async () => {
      const trackingCostDto: TrackingCostDto = {
        trackingLink: 'testtracking.com',
        shippingCost: 7.5,
      };

      await service.updateTrackingCostInfo(3, trackingCostDto);

      const order = await service.findOne(3);
      expect(order.trackingLink).toEqual('https://testtracking.com/');
      expect(order.shippingCost).toEqual(7.5);
    });

    it('throws BadRequestException for delivered order', async () => {
      const trackingCostDto: TrackingCostDto = {
        trackingLink: 'testtracking.com',
        shippingCost: 7.5,
      };
      const orderId = 2;

      const order = await service.findOne(orderId);

      expect(order.status).toEqual(OrderStatus.DELIVERED);

      await expect(
        service.updateTrackingCostInfo(orderId, trackingCostDto),
      ).rejects.toThrow(
        new BadRequestException(
          'Can only update tracking info for pending or shipped orders',
        ),
      );
    });

    it('throws when both fields are not provided for first time setting', async () => {
      const trackingCostDto: TrackingCostDto = {
        trackingLink: 'testtracking.com',
      };
      const orderId = 4;

      const order = await service.findOne(orderId);

      expect(order.shippedAt).toBeNull();
      expect(order.trackingLink).toBeNull();

      await expect(
        service.updateTrackingCostInfo(4, trackingCostDto),
      ).rejects.toThrow(
        new BadRequestException(
          'Must provide both tracking link and shipping cost on initial assignment',
        ),
      );
    });

    it('throws when tracking link is invalid', async () => {
      const trackingCostDto: TrackingCostDto = {
        trackingLink: `javascript:alert("you've been hacked!")`,
        shippingCost: 7.5,
      };

      await expect(
        service.updateTrackingCostInfo(3, trackingCostDto),
      ).rejects.toThrow(
        new BadRequestException(
          'Invalid tracking link. Only valid HTTP/HTTPS URLs are accepted.',
        ),
      );
    });

    it('sets status to shipped when both fields provided and previous status pending', async () => {
      const trackingCostDto: TrackingCostDto = {
        trackingLink: 'testtracking.com',
        shippingCost: 5.75,
      };
      const orderId = 4;

      const order = await service.findOne(orderId);

      expect(order.status).toEqual(OrderStatus.PENDING);
      expect(order.shippedAt).toBeNull();

      await service.updateTrackingCostInfo(orderId, trackingCostDto);

      const updatedOrder = await service.findOne(orderId);

      expect(updatedOrder.status).toEqual(OrderStatus.SHIPPED);
      expect(updatedOrder.shippedAt).toBeDefined();
    });
  });

  describe('confirmDelivery', () => {
    it('should throw BadRequestException for invalid date format', async () => {
      await expect(
        service.confirmDelivery(
          1,
          { dateReceived: 'invalid-date', feedback: 'test feedback' },
          [],
        ),
      ).rejects.toThrow(
        new BadRequestException('Invalid date format for dateReceived'),
      );
    });

    it('should update order with delivery details and set status to delivered and update request status to closed', async () => {
      const orderRepo = testDataSource.getRepository(Order);
      const requestRepo = testDataSource.getRepository(FoodRequest);

      const shippedOrder = await orderRepo.findOne({
        where: { status: OrderStatus.SHIPPED, orderId: 3 },
        relations: ['request'],
      });

      expect(shippedOrder).toBeDefined();

      if (!shippedOrder) throw new Error('Missing shipped order test object');

      const dateReceived = new Date().toISOString();
      const feedback = 'Perfect delivery!';
      const photos = ['photo1.jpg', 'photo2.jpg'];

      const result = await service.confirmDelivery(
        shippedOrder.orderId,
        { dateReceived, feedback },
        photos,
      );

      expect(result.orderId).toBe(shippedOrder.orderId);
      expect(result.status).toBe(OrderStatus.DELIVERED);
      expect(result.dateReceived).toEqual(new Date(dateReceived));
      expect(result.feedback).toBe(feedback);
      expect(result.photos).toEqual(photos);
      expect(result.deliveredAt).toBeNull();

      const updatedRequest = await requestRepo.findOne({
        where: { requestId: shippedOrder.requestId },
        relations: ['orders'],
      });

      if (!updatedRequest)
        throw new Error('Missing updatedRequest test object');

      expect(updatedRequest.status).toBe(FoodRequestStatus.CLOSED);
    });

    it('should update order with delivery details and set status to delivered but request remains active', async () => {
      const orderRepo = testDataSource.getRepository(Order);
      const requestRepo = testDataSource.getRepository(FoodRequest);
      // Get an existing shipped order
      const existingShippedOrder = await orderRepo.findOne({
        where: { status: OrderStatus.SHIPPED },
        relations: ['request'],
      });

      expect(existingShippedOrder).toBeDefined();

      if (!existingShippedOrder)
        throw new Error('Missing existingShippedOrder test object');

      // Add a second shipped order to the same request so it stays active after delivery
      const secondOrder = orderRepo.create({
        requestId: existingShippedOrder.requestId,
        foodManufacturerId: existingShippedOrder.foodManufacturerId,
        assigneeId: existingShippedOrder.assigneeId,
        status: OrderStatus.SHIPPED,
        shippedAt: new Date(),
      });
      await orderRepo.save(secondOrder);

      const dateReceived = new Date().toISOString();
      const feedback = 'Perfect delivery!';
      const photos = ['photo1.jpg', 'photo2.jpg'];

      const result = await service.confirmDelivery(
        existingShippedOrder.orderId,
        { dateReceived, feedback },
        photos,
      );

      expect(result.orderId).toBe(existingShippedOrder.orderId);
      expect(result.status).toBe(OrderStatus.DELIVERED);
      expect(result.dateReceived).toEqual(new Date(dateReceived));
      expect(result.feedback).toBe(feedback);
      expect(result.photos).toEqual(photos);

      const updatedRequest = await requestRepo.findOne({
        where: { requestId: existingShippedOrder.requestId },
        relations: ['orders'],
      });

      if (!updatedRequest)
        throw new Error('Missing updatedRequest test object');

      expect(updatedRequest.status).toBe(FoodRequestStatus.ACTIVE);
    });

    it('should throw NotFoundException for invalid order id', async () => {
      const invalidOrderId = 99999;

      await expect(
        service.confirmDelivery(
          invalidOrderId,
          { dateReceived: new Date().toISOString(), feedback: 'test' },
          [],
        ),
      ).rejects.toThrow(
        new NotFoundException(`Order ${invalidOrderId} not found`),
      );
    });

    it('should throw BadRequestException when order is not shipped', async () => {
      const orderRepo = testDataSource.getRepository(Order);

      const pendingOrder = await orderRepo.findOne({
        where: { status: OrderStatus.PENDING },
      });

      expect(pendingOrder).toBeDefined();

      if (!pendingOrder) throw new Error('Missing pendingOrder test object');

      await expect(
        service.confirmDelivery(
          pendingOrder.orderId,
          { dateReceived: new Date().toISOString(), feedback: 'test' },
          [],
        ),
      ).rejects.toThrow(
        new BadRequestException('Can only confirm delivery for shipped orders'),
      );
    });

    it('should throw BadRequestException when order is already delivered', async () => {
      const orderRepo = testDataSource.getRepository(Order);

      const deliveredOrder = await orderRepo.findOne({
        where: { status: OrderStatus.DELIVERED },
      });

      expect(deliveredOrder).toBeDefined();

      if (!deliveredOrder)
        throw new Error('Missing deliveredOrder test object');

      await expect(
        service.confirmDelivery(
          deliveredOrder.orderId,
          { dateReceived: new Date().toISOString(), feedback: 'test' },
          [],
        ),
      ).rejects.toThrow(
        new BadRequestException('Can only confirm delivery for shipped orders'),
      );
    });
  });

  describe('createOrder', () => {
    let validCreateOrderDto: CreateOrderDto;
    let parsedAllocations: Map<number, number>;
    const userId = 3;

    beforeEach(() => {
      validCreateOrderDto = {
        foodRequestId: 1,
        manufacturerId: 1,
        itemAllocations: {
          1: 10,
          2: 3,
        },
      };

      parsedAllocations = new Map<number, number>([
        [1, 10],
        [2, 3],
      ]);
    });

    it('should create a new order successfully', async () => {
      const allocationRepo = testDataSource.getRepository(Allocation);
      const donationItemRepo = testDataSource.getRepository(DonationItem);
      const donationRepo = testDataSource.getRepository(Donation);

      parsedAllocations.set(9, 5);

      // Initial donation items
      const donationItem1 = await donationItemRepo.findOne({
        where: { itemId: 1 },
      });
      const donationItem2 = await donationItemRepo.findOne({
        where: { itemId: 2 },
      });
      const donationItem3 = await donationItemRepo.findOne({
        where: { itemId: 9 },
      });

      if (!donationItem1 || !donationItem2 || !donationItem3)
        throw new Error('Missing dummy donation items');

      donationItem3.quantity = 100;

      await donationItemRepo.save(donationItem3);

      const createdOrder = await service.create(
        validCreateOrderDto.foodRequestId,
        validCreateOrderDto.manufacturerId,
        parsedAllocations,
        userId,
      );

      expect(createdOrder).toBeDefined();
      expect(createdOrder.orderId).toBeDefined();
      expect(createdOrder.status).toEqual(OrderStatus.PENDING);
      expect(createdOrder.assigneeId).toEqual(userId);
      expect(createdOrder.foodManufacturerId).toEqual(
        validCreateOrderDto.manufacturerId,
      );
      expect(createdOrder.requestId).toEqual(validCreateOrderDto.foodRequestId);

      const allocations = await allocationRepo.find({
        where: { orderId: createdOrder.orderId },
      });
      expect(allocations.length).toBe(parsedAllocations.size);
      expect(allocations.map((a) => a.itemId)).toEqual(
        expect.arrayContaining([1, 2, 9]),
      );
      expect(allocations.map((a) => a.allocatedQuantity)).toEqual(
        expect.arrayContaining([10, 3, 5]),
      );

      const updatedDonationItem1 = await donationItemRepo.findOne({
        where: { itemId: 1 },
      });
      const updatedDonationItem2 = await donationItemRepo.findOne({
        where: { itemId: 2 },
      });
      const updatedDonationItem3 = await donationItemRepo.findOne({
        where: { itemId: 9 },
      });

      expect(updatedDonationItem1!.reservedQuantity).toBe(
        donationItem1.reservedQuantity + 10,
      );
      expect(updatedDonationItem2!.reservedQuantity).toBe(
        donationItem2.reservedQuantity + 3,
      );
      expect(updatedDonationItem3!.reservedQuantity).toBe(
        donationItem3.reservedQuantity + 5,
      );

      const matchedDonation1 = await donationRepo.findOne({
        where: { donationId: 1 },
      });
      expect(matchedDonation1?.status).toBe(DonationStatus.MATCHED);

      const matchedDonation2 = await donationRepo.findOne({
        where: { donationId: 2 },
      });
      expect(matchedDonation2?.status).toBe(DonationStatus.MATCHED);
    });

    it('should throw BadRequestException if request is not active', async () => {
      const requestRepo = testDataSource.getRepository(FoodRequest);
      const donationItemRepo = testDataSource.getRepository(DonationItem);

      const request = await requestRepo.findOne({ where: { requestId: 2 } });

      if (!request) throw new Error('Missing dummy request');

      request.status = FoodRequestStatus.CLOSED;
      await requestRepo.save(request);

      validCreateOrderDto.foodRequestId = 2;
      await expect(
        service.create(
          validCreateOrderDto.foodRequestId,
          validCreateOrderDto.manufacturerId,
          parsedAllocations,
          userId,
        ),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.create(
          validCreateOrderDto.foodRequestId,
          validCreateOrderDto.manufacturerId,
          parsedAllocations,
          userId,
        ),
      ).rejects.toThrow(
        `Request ${validCreateOrderDto.foodRequestId} is not active`,
      );

      // Asserting that donation item reserved quantity wasn't updated
      const donationItem1 = await donationItemRepo.findOne({
        where: { itemId: 1 },
      });
      expect(donationItem1?.reservedQuantity).toBe(10);
    });

    it('should throw BadRequestException if manufacturer is not approved', async () => {
      const donationItemRepo = testDataSource.getRepository(DonationItem);

      validCreateOrderDto.foodRequestId = 1;
      // Manufacturer that has status pending
      validCreateOrderDto.manufacturerId = 3;
      await expect(
        service.create(
          validCreateOrderDto.foodRequestId,
          validCreateOrderDto.manufacturerId,
          parsedAllocations,
          userId,
        ),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.create(
          validCreateOrderDto.foodRequestId,
          validCreateOrderDto.manufacturerId,
          parsedAllocations,
          userId,
        ),
      ).rejects.toThrow(
        `Manufacturer ${validCreateOrderDto.manufacturerId} is not approved`,
      );

      // Asserting that donation item reserved quantity wasn't updated
      const donationItem1 = await donationItemRepo.findOne({
        where: { itemId: 1 },
      });
      expect(donationItem1?.reservedQuantity).toBe(10);
    });

    it('should throw NotFoundException if donation item does not exist', async () => {
      const donationItemRepo = testDataSource.getRepository(DonationItem);

      parsedAllocations.set(999, 1);

      await expect(
        service.create(
          validCreateOrderDto.foodRequestId,
          validCreateOrderDto.manufacturerId,
          parsedAllocations,
          userId,
        ),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.create(
          validCreateOrderDto.foodRequestId,
          validCreateOrderDto.manufacturerId,
          parsedAllocations,
          userId,
        ),
      ).rejects.toThrow(`Donation items not found for ID(s): 999`);

      // Asserting that donation item reserved quantity wasn't updated
      const donationItem1 = await donationItemRepo.findOne({
        where: { itemId: 1 },
      });
      expect(donationItem1?.reservedQuantity).toBe(10);
    });

    it('should throw BadRequestException if allocated quantity exceeds remaining', async () => {
      const donationItemRepo = testDataSource.getRepository(DonationItem);

      const donationItemId = 2;

      parsedAllocations = new Map<number, number>([
        [donationItemId, 500],
        [1, 10],
      ]);
      await expect(
        service.create(
          validCreateOrderDto.foodRequestId,
          validCreateOrderDto.manufacturerId,
          parsedAllocations,
          userId,
        ),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.create(
          validCreateOrderDto.foodRequestId,
          validCreateOrderDto.manufacturerId,
          parsedAllocations,
          userId,
        ),
      ).rejects.toThrow(
        `Donation item ${donationItemId} quantity to allocate exceeds remaining quantity`,
      );

      // Asserting that donation item reserved quantity wasn't updated
      const donationItem1 = await donationItemRepo.findOne({
        where: { itemId: 1 },
      });
      expect(donationItem1?.reservedQuantity).toBe(10);
    });

    it('should throw Error if donation is not associated with manufacturer', async () => {
      const donationItemRepo = testDataSource.getRepository(DonationItem);

      const donationItemId = 7;
      parsedAllocations = new Map<number, number>([
        [donationItemId, 2],
        [1, 10],
      ]);
      await expect(
        service.create(
          validCreateOrderDto.foodRequestId,
          validCreateOrderDto.manufacturerId,
          parsedAllocations,
          userId,
        ),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.create(
          validCreateOrderDto.foodRequestId,
          validCreateOrderDto.manufacturerId,
          parsedAllocations,
          userId,
        ),
      ).rejects.toThrow(
        `The following donation items are not associated with the current food manufacturer: Donation item ID ${donationItemId} with Donation ID 3`,
      );

      // Asserting that donation item reserved quantity wasn't updated
      const donationItem1 = await donationItemRepo.findOne({
        where: { itemId: 1 },
      });
      expect(donationItem1?.reservedQuantity).toBe(10);
    });
  });
  describe('getAllOrdersForVolunteer', () => {
    it('should return all orders across all pantries and assignees, with required actions for assigned orders', async () => {
      const volunteerId = 6;
      const result = await service.getAllOrdersForVolunteer(volunteerId);

      expect(result).toHaveLength(4);

      const assignedOrder = result.find((o) => o.assignee.id === volunteerId);
      expect(assignedOrder?.actionCompletion).toEqual({
        confirmDonationReceipt: false,
        notifyPantry: false,
      });

      const notAssignedOrder = result.find(
        (o) => o.assignee.id !== volunteerId,
      );
      expect(notAssignedOrder?.actionCompletion).toBeUndefined();
    });

    it('should map the rest of the data correctly', async () => {
      const volunteerId = 6;
      const result = await service.getAllOrdersForVolunteer(volunteerId);
      const firstOrder = result[0];

      expect(firstOrder.orderId).toBe(4);
      expect(firstOrder.status).toBe(OrderStatus.PENDING);
      expect(firstOrder).toHaveProperty('createdAt');
      expect(firstOrder).toHaveProperty('shippedAt');
      expect(firstOrder).toHaveProperty('deliveredAt');
      expect(firstOrder.pantryName).toBe('Community Food Pantry Downtown');
      expect(firstOrder.assignee.id).toBe(volunteerId);
    });
  });

  describe('completeVolunteerAction', () => {
    it('should successfully complete confirmDonationReceipt', async () => {
      const orderId = 2;
      const order = await service.findOne(orderId);
      expect(order.confirmDonationReceipt).toBe(false);
      await testDataSource.query(
        `UPDATE orders SET status = '${OrderStatus.SHIPPED}' WHERE order_id = ${orderId}`,
      );

      await service.completeVolunteerAction(
        orderId,
        VolunteerAction.CONFIRM_DONATION_RECEIPT,
      );

      const updatedOrder = await service.findOne(orderId);
      expect(updatedOrder.confirmDonationReceipt).toBe(true);
    });

    it('should successfully complete notifyPantry', async () => {
      const orderId = 3; // shipped order
      const order = await service.findOne(orderId);
      expect(order.notifyPantry).toBe(false);

      await service.completeVolunteerAction(
        orderId,
        VolunteerAction.NOTIFY_PANTRY,
      );

      const updatedOrder = await service.findOne(orderId);
      expect(updatedOrder.notifyPantry).toBe(true);
    });

    it('throws when order is non-existent', async () => {
      const orderId = 999;
      await expect(
        service.completeVolunteerAction(
          orderId,
          VolunteerAction.CONFIRM_DONATION_RECEIPT,
        ),
      ).rejects.toThrow(new NotFoundException(`Order ${orderId} not found`));
    });

    it('throws when order is not shipped', async () => {
      const orderId = 2;
      const order = await service.findOne(orderId);
      expect(order.status).not.toBe(OrderStatus.SHIPPED);
      await expect(
        service.completeVolunteerAction(
          orderId,
          VolunteerAction.CONFIRM_DONATION_RECEIPT,
        ),
      ).rejects.toThrow(
        new BadRequestException(
          `Action ${VolunteerAction.CONFIRM_DONATION_RECEIPT} can only be completed for shipped orders`,
        ),
      );
    });

    it('throws when action is already completed', async () => {
      const orderId = 2;
      const action = VolunteerAction.NOTIFY_PANTRY;
      await testDataSource.query(
        `UPDATE orders SET notify_pantry = true WHERE order_id = ${orderId}`,
      );
      await expect(
        service.completeVolunteerAction(orderId, action),
      ).rejects.toThrow(
        new BadRequestException(
          `Action ${action} already completed for Order ${orderId}`,
        ),
      );
    });
  });
});
