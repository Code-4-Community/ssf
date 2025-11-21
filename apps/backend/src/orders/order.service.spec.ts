import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { OrdersService } from './order.service';
import { Order } from './order.entity';
import { testDataSource } from '../config/typeormTestDataSource';
import { CreateDummyData1759636753110 } from '../migrations/1759636753110-createDummyData';

describe('OrdersService', () => {
  let service: OrdersService;

  beforeAll(async () => {
    // Initialize DB and run all migrations once to create tables
    if (!testDataSource.isInitialized) {
      await testDataSource.initialize();
      await testDataSource.runMigrations();
    }

    // Set up NestJS testing module
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
    // Truncate all tables in FK-safe order (removes data, keeps tables)
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

    // Reseed dummy data
    const queryRunner = testDataSource.createQueryRunner();
    await queryRunner.connect();
    await new CreateDummyData1759636753110().up(queryRunner);
    await queryRunner.release();
  });

  afterAll(async () => {
    await testDataSource.destroy();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAll', () => {
    it('should return orders filtered by status', async () => {
      const orders = await service.getAll({ status: 'delivered' });
      expect(orders.length).toBeGreaterThanOrEqual(1);
    });

    it('should return empty array when no status filters match', async () => {
      const orders = await service.getAll({ status: 'invalid' });
      expect(orders).toEqual([]);
    });
  });
});
