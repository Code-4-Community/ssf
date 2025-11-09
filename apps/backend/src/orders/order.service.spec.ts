import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './order.entity';
import { OrdersService } from './order.service';
import { OrdersModule } from './order.module';
import { testDataSource } from '../config/typeormTestDataSource';
import { Repository } from 'typeorm';

describe('OrdersService', () => {
  let service: OrdersService;
  let repository: Repository<Order>;

  beforeAll(async () => {
    // Initialize the DataSource if it hasn't been initialized yet
    if (!testDataSource.isInitialized) {
      await testDataSource.initialize();
    }

    const module: TestingModule = await Test.createTestingModule({
      imports: [OrdersModule],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    repository = testDataSource.getRepository(Order);
  });

  beforeEach(async () => {
    await testDataSource.dropDatabase();      // wipe DB
    await testDataSource.runMigrations();     // rebuild schema from migrations
  });

  afterAll(async () => {
    await testDataSource.destroy();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAll', () => {
    it('should return orders filtered by status', async () => {
      const result = await service.getAll({ status: 'pending' });

      expect(result).toEqual([
        {
          orderId: 4,
          requestId: 4,
          pantry: { pantryId: 1, pantryName: 'Community Food Pantry Downtown' },
          shippedBy: 1,
          status: 'pending',
          createdAt: new Date('2024-02-03 12:00:00'),
          shippedAt: null,
          deliveredAt: null,
          donationId: 1,
        },
      ]);
    });

    it('should return empty array when no status filters match', async () => {
      const result = await service.getAll({ status: 'invalid status' });

      expect(result).toEqual([]);
    });

    it('should return orders filtered by pantryName', async () => {
      const result = await service.getAll({
        pantryNames: ['Community Food Pantry Downtown'],
      });

      expect(result).toEqual([
        {
          orderId: 1,
          requestId: 1,
          pantry: { pantryId: 1, pantryName: 'Community Food Pantry Downtown' },
          shippedBy: 1,
          status: 'delivered',
          createdAt: new Date('2024-01-16 09:00:00'),
          shippedAt: new Date('2024-01-17 08:00:00'),
          deliveredAt: new Date('2024-01-18 14:30:00'),
          donationId: 1,
        },
        {
          orderId: 4,
          requestId: 4,
          pantry: { pantryId: 1, pantryName: 'Community Food Pantry Downtown' },
          shippedBy: 1,
          status: 'pending',
          createdAt: new Date('2024-02-03 12:00:00'),
          shippedAt: null,
          deliveredAt: null,
          donationId: 1,
        },
      ]);
    });

    it('should return empty array when no pantryName filters match', async () => {
      const result = await service.getAll({
        pantryNames: ['Nonexistent Pantry'],
      });

      expect(result).toEqual([]);
    });

    it('should return orders filtered by both status and pantryName', async () => {
      const result = await service.getAll({
        status: 'delivered',
        pantryNames: ['Community Food Pantry Downtown'],
      });

      expect(result).toEqual([
        {
          orderId: 1,
          requestId: 1,
          pantry: { pantryId: 1, pantryName: 'Community Food Pantry Downtown' },
          shippedBy: 1,
          status: 'delivered',
          createdAt: new Date('2024-01-16 09:00:00'),
          shippedAt: new Date('2024-01-17 08:00:00'),
          deliveredAt: new Date('2024-01-18 14:30:00'),
          donationId: 1,
        },
        {
          orderId: 5,
          requestId: 4,
          pantry: { pantryId: 1, pantryName: 'Community Food Pantry Downtown' },
          shippedBy: 1,
          status: 'delivered',
          createdAt: new Date('2024-02-03 12:00:00'),
          shippedAt: new Date('2024-02-04 12:00:00'),
          deliveredAt: new Date('2024-02-05 12:00:00'),
          donationId: 1,
        },
      ]);
    });
  });
});
