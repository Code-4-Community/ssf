import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { OrdersService } from './order.service';
import { Order } from './order.entity';
import { testDataSource } from '../config/typeormTestDataSource';
import { PopulateDummyData1768501812134 } from '../migrations/1768501812134-populateDummyData';

describe('OrdersService', () => {
  let service: OrdersService;

  beforeAll(async () => {
    // Create all tables and run migrations
    if (!testDataSource.isInitialized) {
      await testDataSource.initialize();
      await testDataSource.runMigrations();
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: getRepositoryToken(Order),
          useValue: testDataSource.getRepository(Order),
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  beforeEach(async () => {
    const fkSafeOrder = [
      'volunteer_assignments',
      'allocations',
      'orders',
      'food_requests',
      'donation_items',
      'donations',
      'pantries',
      'food_manufacturers',
      'users',
    ];

    // Delete all data, keep schema
    for (const table of fkSafeOrder) {
      await testDataSource.query(
        `TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE`,
      );
    }

    // Seed dummy data
    const queryRunner = testDataSource.createQueryRunner();
    await queryRunner.connect();
    try {
      await new PopulateDummyData1768501812134().up(queryRunner);
    } finally {
      await queryRunner.release();
    }
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
      const orders = await service.getAll({ status: 'delivered' });

      expect(orders).toHaveLength(2);
      expect(orders.every((order) => order.status === 'delivered')).toBe(true);
    });

    it('returns orders filtered by pantry names', async () => {
      const orders = await service.getAll({
        pantryNames: ['Community Food Pantry Downtown'],
      });

      expect(orders).toHaveLength(2);
      expect(
        orders.every(
          (order) =>
            order.pantry.pantryName === 'Community Food Pantry Downtown',
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
        status: 'delivered',
        pantryNames: ['Westside Community Kitchen'],
      });

      expect(orders).toHaveLength(1);
      expect(orders[0].pantry.pantryName).toBe('Westside Community Kitchen');
      expect(orders[0].status).toBe('delivered');
    });
  });
});
