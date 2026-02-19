import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { OrdersService } from './order.service';
import { Order } from './order.entity';
import { testDataSource } from '../config/typeormTestDataSource';
import { OrderStatus } from './types';
import { Pantry } from '../pantries/pantries.entity';
import { FoodRequest } from '../foodRequests/request.entity';
import { Repository } from 'typeorm';
import { FoodRequestStatus } from '../foodRequests/types';

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
    await testDataSource.query(`DROP SCHEMA public CASCADE`);
    await testDataSource.query(`CREATE SCHEMA public`);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
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

  describe('confirmDelivery', () => {
    it('should update order with delivery details and set status to delivered', async () => {
      // Get an existing shipped order from dummy data
      const orderRepo = testDataSource.getRepository(Order);
      const requestRepo = testDataSource.getRepository(FoodRequest);

      const shippedOrder = await orderRepo.findOne({
        where: { status: OrderStatus.SHIPPED },
        relations: ['request'],
      });

      expect(shippedOrder).toBeDefined();

      const dateReceived = new Date();
      const feedback = 'Perfect delivery!';
      const photos = ['photo1.jpg', 'photo2.jpg'];

      const result = await service.confirmDelivery(
        shippedOrder.orderId,
        dateReceived,
        feedback,
        photos,
      );

      expect(result.orderId).toBe(shippedOrder.orderId);
      expect(result.status).toBe(OrderStatus.DELIVERED);
      expect(result.dateReceived).toEqual(dateReceived);
      expect(result.feedback).toBe(feedback);
      expect(result.photos).toEqual(photos);
      expect(result.deliveredAt).toBeNull();

      // Verify request status was updated
      const updatedRequest = await requestRepo.findOne({
        where: { requestId: shippedOrder.requestId },
        relations: ['orders'],
      });

      // Check if all orders for this request are delivered
      const allDelivered = updatedRequest.orders.every(
        (order) => order.status === OrderStatus.DELIVERED,
      );

      if (allDelivered) {
        expect(updatedRequest.status).toBe(FoodRequestStatus.CLOSED);
      } else {
        expect(updatedRequest.status).toBe(FoodRequestStatus.ACTIVE);
      }
    });

    it('should set request status to CLOSED when all orders are delivered', async () => {
      const orderRepo = testDataSource.getRepository(Order);
      const requestRepo = testDataSource.getRepository(FoodRequest);

      // Find a request with only one order that's shipped
      const request = await requestRepo.findOne({
        where: { status: FoodRequestStatus.ACTIVE },
        relations: ['orders'],
      });

      // Find a shipped order for this request
      const shippedOrder = request.orders.find(
        (order) => order.status === OrderStatus.SHIPPED,
      );

      if (shippedOrder) {
        // Mark all other orders as delivered first
        for (const order of request.orders) {
          if (order.orderId !== shippedOrder.orderId) {
            order.status = OrderStatus.DELIVERED;
            await orderRepo.save(order);
          }
        }

        // Now confirm the last shipped order
        await service.confirmDelivery(
          shippedOrder.orderId,
          new Date(),
          'Final delivery',
          [],
        );

        // Verify request is now closed
        const updatedRequest = await requestRepo.findOne({
          where: { requestId: request.requestId },
          relations: ['orders'],
        });

        expect(
          updatedRequest.orders.every(
            (o) => o.status === OrderStatus.DELIVERED,
          ),
        ).toBe(true);
        expect(updatedRequest.status).toBe(FoodRequestStatus.CLOSED);
      }
    });

    it('should set request status to ACTIVE when not all orders are delivered', async () => {
      const orderRepo = testDataSource.getRepository(Order);
      const requestRepo = testDataSource.getRepository(FoodRequest);

      // Find a request with multiple orders
      const request = await requestRepo.findOne({
        where: { status: FoodRequestStatus.ACTIVE },
        relations: ['orders'],
      });

      if (request && request.orders.length > 1) {
        const shippedOrder = request.orders.find(
          (order) => order.status === OrderStatus.SHIPPED,
        );

        if (shippedOrder) {
          // Confirm only one order, leaving others undelivered
          await service.confirmDelivery(
            shippedOrder.orderId,
            new Date(),
            'Partial delivery',
            [],
          );

          // Verify request is still active
          const updatedRequest = await requestRepo.findOne({
            where: { requestId: request.requestId },
            relations: ['orders'],
          });

          expect(
            updatedRequest.orders.some(
              (o) => o.status !== OrderStatus.DELIVERED,
            ),
          ).toBe(true);
          expect(updatedRequest.status).toBe(FoodRequestStatus.ACTIVE);
        }
      }
    });

    it('should throw NotFoundException for invalid order id', async () => {
      const invalidOrderId = 99999;

      await expect(
        service.confirmDelivery(invalidOrderId, new Date(), 'test', []),
      ).rejects.toThrow(`Order ${invalidOrderId} not found`);
    });
  });
});
