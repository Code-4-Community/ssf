import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Order } from './order.entity';
import { OrdersService } from './order.service';
import { testDataSource } from '../config/typeormTestDataSource';
import { Repository } from 'typeorm';

describe('OrdersService', () => {
  let service: OrdersService;
  let repository: Repository<Order>;

  beforeAll(async () => {
    if (!testDataSource.isInitialized) {
      await testDataSource.initialize();
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
    repository = testDataSource.getRepository(Order);
  });

  beforeEach(async () => {
    // reset tables
    await testDataSource.synchronize(true);

    // optional: seed one sample record
    await repository.save({
      orderId: 1,
      requestId: 1,
      pantry: { pantryId: 1, pantryName: 'Community Food Pantry Downtown' },
      shippedBy: 1,
      status: 'delivered',
      createdAt: new Date('2024-01-16T09:00:00Z'),
      shippedAt: new Date('2024-01-17T08:00:00Z'),
      deliveredAt: new Date('2024-01-18T14:30:00Z'),
      donationId: 1,
    });
  });

  afterAll(async () => {
    await testDataSource.destroy();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAll', () => {
    it('should return orders filtered by status', async () => {
      const result = await service.getAll({ status: 'delivered' });
      expect(result.length).toBeGreaterThanOrEqual(1);
    });

    it('should return empty array when no status filters match', async () => {
      const result = await service.getAll({ status: 'invalid' });
      expect(result).toEqual([]);
    });
  });
});
