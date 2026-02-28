import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { OrdersService } from './order.service';
import { Order } from './order.entity';
import { testDataSource } from '../config/typeormTestDataSource';
import { OrderStatus } from './types';
import { Pantry } from '../pantries/pantries.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TrackingCostDto } from './dtos/tracking-cost.dto';
import { FoodRequest } from '../foodRequests/request.entity';
import 'multer';
import { FoodRequestStatus } from '../foodRequests/types';
import { RequestsService } from '../foodRequests/request.service';

// Set 1 minute timeout for async DB operations
jest.setTimeout(60000);

describe('OrdersService', () => {
  let service: OrdersService;

  beforeAll(async () => {
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
        {
          provide: getRepositoryToken(Order),
          useValue: testDataSource.getRepository(Order),
        },
        {
          provide: getRepositoryToken(Pantry),
          useValue: testDataSource.getRepository(Pantry),
        },
        {
          provide: getRepositoryToken(FoodRequest),
          useValue: testDataSource.getRepository(FoodRequest),
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  beforeEach(async () => {
    // Run all migrations fresh for each test
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
      expect(years).not.toContain(2026);
      // Remaining orders may still be 2024; none should be 2026
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
        trackingLink: 'test',
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

    it('updates tracking link for shipped order', async () => {
      const trackingCostDto: TrackingCostDto = {
        trackingLink: 'samplelink.com',
      };

      await service.updateTrackingCostInfo(3, trackingCostDto);

      const order = await service.findOne(3);
      expect(order.trackingLink).toBeDefined();
      expect(order.trackingLink).toEqual('samplelink.com');
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

    it('updates both shipping cost and tracking link', async () => {
      const trackingCostDto: TrackingCostDto = {
        trackingLink: 'testtracking.com',
        shippingCost: 7.5,
      };

      await service.updateTrackingCostInfo(3, trackingCostDto);

      const order = await service.findOne(3);
      expect(order.trackingLink).toEqual('testtracking.com');
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
});
