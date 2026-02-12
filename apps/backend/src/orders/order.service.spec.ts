import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { OrdersService } from './order.service';
import { Order } from './order.entity';
import { testDataSource } from '../config/typeormTestDataSource';
import { OrderStatus } from './types';
import { Pantry } from '../pantries/pantries.entity';
import { User } from '../users/user.entity';
import {
  AllergensConfidence,
  ClientVisitFrequency,
  PantryStatus,
  RefrigeratedDonation,
  ReserveFoodForAllergic,
  ServeAllergicChildren,
} from '../pantries/types';

const mockOrdersRepository = mock<Repository<Order>>();

const mockPantry: Partial<Pantry> = {
  pantryId: 1,
  pantryName: 'Test Pantry',
  allergenClients: '',
  refrigeratedDonation: RefrigeratedDonation.NO,
  reserveFoodForAllergic: ReserveFoodForAllergic.YES,
  reservationExplanation: '',
  dedicatedAllergyFriendly: false,
  clientVisitFrequency: ClientVisitFrequency.DAILY,
  identifyAllergensConfidence: AllergensConfidence.NOT_VERY_CONFIDENT,
  serveAllergicChildren: ServeAllergicChildren.NO,
  newsletterSubscription: false,
  restrictions: [],
  pantryUser: null as unknown as User,
  status: PantryStatus.APPROVED,
  dateApplied: new Date(),
  activities: [],
  activitiesComments: '',
  itemsInStock: '',
  needMoreOptions: '',
  volunteers: [],
};
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
});
