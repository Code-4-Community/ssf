import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { OrdersService } from './order.service';
import { Order } from './order.entity';
import { testDataSource } from '../config/typeormTestDataSource';
import { CreateDummyData1759636753110 } from '../migrations/1759636753110-createDummyData';

//jest.setTimeout(30000);

describe('OrdersService (integration)', () => {
  let service: OrdersService;

  beforeAll(async () => {
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

    for (const table of fkSafeOrder) {
      await testDataSource.query(
        `TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE`,
      );
    }

    const queryRunner = testDataSource.createQueryRunner();
    await queryRunner.connect();
    try {
      await new CreateDummyData1759636753110().up(queryRunner);
    } finally {
      await queryRunner.release();
    }
  });

  afterAll(async () => {
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

      expect(orders).toHaveLength(3);
      expect(orders.every((order) => order.status === 'delivered')).toBe(true);
    });

    it('returns empty array when status filter matches nothing', async () => {
      const orders = await service.getAll({ status: 'invalid' });

      expect(orders).toEqual([]);
    });

    it('returns orders filtered by pantry names', async () => {
      const orders = await service.getAll({
        pantryNames: ['Community Food Pantry Downtown'],
      });

      expect(orders).toHaveLength(3);
      expect(
        orders.every(
          (order) => order.pantry.pantryName === 'Community Food Pantry Downtown',
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
