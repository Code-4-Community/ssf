import { Test, TestingModule } from '@nestjs/testing';
import { PantriesService } from './pantries.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Pantry } from './pantries.entity';
import { NotFoundException } from '@nestjs/common';
import { User } from '../users/user.entity';
import { PantryApplicationDto } from './dtos/pantry-application.dto';
import {
  ClientVisitFrequency,
  RefrigeratedDonation,
  ServeAllergicChildren,
  ReserveFoodForAllergic,
  Activity,
  AllergensConfidence,
} from './types';
import { ApplicationStatus } from '../shared/types';
import { testDataSource } from '../config/typeormTestDataSource';
import { Order } from '../orders/order.entity';
import { FoodRequest } from '../foodRequests/request.entity';
import { RequestsService } from '../foodRequests/request.service';
import { OrdersService } from '../orders/order.service';
import { UsersService } from '../users/users.service';
import { AuthService } from '../auth/auth.service';

describe('PantriesService (integration using dummy data)', () => {
  let service: PantriesService;

  beforeAll(async () => {
    if (!testDataSource.isInitialized) {
      await testDataSource.initialize();
    }
    await testDataSource.query(`DROP SCHEMA IF EXISTS public CASCADE`);
    await testDataSource.query(`CREATE SCHEMA public`);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PantriesService,
        OrdersService,
        RequestsService,
        UsersService,
        {
          provide: AuthService,
          useValue: {
            adminCreateUser: jest.fn().mockResolvedValue('test-sub'),
          },
        },
        {
          provide: getRepositoryToken(Pantry),
          useValue: testDataSource.getRepository(Pantry),
        },
        {
          provide: getRepositoryToken(User),
          useValue: testDataSource.getRepository(User),
        },
        {
          provide: getRepositoryToken(Order),
          useValue: testDataSource.getRepository(Order),
        },
        {
          provide: getRepositoryToken(FoodRequest),
          useValue: testDataSource.getRepository(FoodRequest),
        },
      ],
    }).compile();

    service = module.get<PantriesService>(PantriesService);
  });

  beforeEach(async () => {
    await testDataSource.runMigrations();
  });

  afterEach(async () => {
    await testDataSource.query(`DROP SCHEMA public CASCADE`);
    await testDataSource.query(`CREATE SCHEMA public`);
  });

  afterAll(async () => {
    if (testDataSource.isInitialized) {
      await testDataSource.destroy();
    }
  });

  it('service should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('returns pantry by existing ID', async () => {
      const pantry = await service.findOne(1);
      expect(pantry).toBeDefined();
      expect(pantry.pantryId).toBe(1);
    });

    it('throws NotFoundException for missing ID', async () => {
      await expect(service.findOne(9999)).rejects.toThrow(
        new NotFoundException('Pantry 9999 not found'),
      );
    });
  });

  describe('getPendingPantries', () => {
    it('returns pantries with pending status', async () => {
      const pending = await service.getPendingPantries();
      expect(pending.length).toBeGreaterThan(0);
      expect(pending.every((p) => p.status === ApplicationStatus.PENDING)).toBe(
        true,
      );
    });
  });

  describe('approve', () => {
    it('approves a pending pantry', async () => {
      const pantryBefore = await service.findOne(5);
      expect(pantryBefore.status).toBe(ApplicationStatus.PENDING);
      await service.approve(5);
      const pantryAfter = await service.findOne(5);
      expect(pantryAfter.status).toBe(ApplicationStatus.APPROVED);
    });

    it('throws when approving non-existent', async () => {
      await expect(service.approve(9999)).rejects.toThrow(
        new NotFoundException('Pantry 9999 not found'),
      );
    });
  });

  describe('deny', () => {
    it('denies a pending pantry', async () => {
      const pantryBefore = await service.findOne(6);
      expect(pantryBefore.status).toBe(ApplicationStatus.PENDING);
      await service.deny(6);
      const pantryAfter = await service.findOne(6);
      expect(pantryAfter.status).toBe(ApplicationStatus.DENIED);
    });

    it('throws when denying non-existent', async () => {
      await expect(service.deny(9999)).rejects.toThrow(
        new NotFoundException('Pantry 9999 not found'),
      );
    });
  });

  describe('addPantry', () => {
    it('creates pantry with minimal required fields', async () => {
      const dto: PantryApplicationDto = {
        contactFirstName: 'Jane',
        contactLastName: 'Doe',
        contactEmail: 'jane.doe@example.com',
        contactPhone: '555-555-5555',
        hasEmailContact: true,
        pantryName: 'Test Minimal Pantry',
        shipmentAddressLine1: '1 Test St',
        shipmentAddressCity: 'Testville',
        shipmentAddressState: 'TX',
        shipmentAddressZip: '11111',
        mailingAddressLine1: '1 Test St',
        mailingAddressCity: 'Testville',
        mailingAddressState: 'TX',
        mailingAddressZip: '11111',
        allergenClients: 'none',
        restrictions: ['none'],
        refrigeratedDonation: RefrigeratedDonation.NO,
        acceptFoodDeliveries: false,
        reserveFoodForAllergic: ReserveFoodForAllergic.NO,
        dedicatedAllergyFriendly: false,
        activities: [Activity.CREATE_LABELED_SHELF],
        itemsInStock: 'none',
        needMoreOptions: 'none',
      };

      await service.addPantry(dto);
      const saved = await testDataSource.getRepository(Pantry).findOne({
        where: { pantryName: 'Test Minimal Pantry' },
        relations: ['pantryUser'],
      });
      expect(saved).toBeDefined();
      expect(saved?.pantryUser?.email).toBe('jane.doe@example.com');
      expect(saved?.status).toBe(ApplicationStatus.PENDING);
    });

    it('creates pantry with all optional fields included', async () => {
      const dto: PantryApplicationDto = {
        contactFirstName: 'John',
        contactLastName: 'Smith',
        contactEmail: 'john.smith@example.com',
        contactPhone: '555-555-5556',
        hasEmailContact: true,
        emailContactOther: 'Use work phone',
        secondaryContactFirstName: 'Sarah',
        secondaryContactLastName: 'Johnson',
        secondaryContactEmail: 'sarah.johnson@example.com',
        secondaryContactPhone: '555-555-5557',
        pantryName: 'Test Full Pantry',
        shipmentAddressLine1: '100 Main St',
        shipmentAddressLine2: 'Suite 200',
        shipmentAddressCity: 'Springfield',
        shipmentAddressState: 'IL',
        shipmentAddressZip: '62701',
        shipmentAddressCountry: 'USA',
        mailingAddressLine1: '100 Main St',
        mailingAddressLine2: 'Suite 200',
        mailingAddressCity: 'Springfield',
        mailingAddressState: 'IL',
        mailingAddressZip: '62701',
        mailingAddressCountry: 'USA',
        allergenClients: '10 to 20',
        restrictions: ['Peanut allergy', 'Tree nut allergy'],
        refrigeratedDonation: RefrigeratedDonation.YES,
        acceptFoodDeliveries: true,
        deliveryWindowInstructions: 'Weekdays 9am-5pm',
        reserveFoodForAllergic: ReserveFoodForAllergic.SOME,
        reservationExplanation: 'We have a dedicated section',
        dedicatedAllergyFriendly: true,
        clientVisitFrequency: ClientVisitFrequency.DAILY,
        identifyAllergensConfidence: AllergensConfidence.VERY_CONFIDENT,
        serveAllergicChildren: ServeAllergicChildren.YES_MANY,
        activities: [Activity.CREATE_LABELED_SHELF, Activity.COLLECT_FEEDBACK],
        activitiesComments: 'We are committed to allergen management',
        itemsInStock: 'Canned goods, pasta',
        needMoreOptions: 'Fresh produce',
        newsletterSubscription: true,
      } as PantryApplicationDto;

      await service.addPantry(dto);
      const saved = await testDataSource.getRepository(Pantry).findOne({
        where: { pantryName: 'Test Full Pantry' },
        relations: ['pantryUser'],
      });
      expect(saved).toBeDefined();
      expect(saved?.pantryUser?.email).toBe('john.smith@example.com');
      expect(saved?.status).toBe(ApplicationStatus.PENDING);
      expect(saved?.secondaryContactFirstName).toBe('Sarah');
      expect(saved?.shipmentAddressLine2).toBe('Suite 200');
    });
  });

  describe('getPantryStats (single pantry)', () => {
    it('throws NotFoundException for non-existent pantry names', async () => {
      await expect(
        service.getPantryStats(['Nonexistent Pantry']),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException when some provided pantry names do not exist', async () => {
      await expect(
        service.getPantryStats([
          'Community Food Pantry Downtown',
          'Fake Pantry',
        ]),
      ).rejects.toThrow(NotFoundException);
    });

    it('error message includes the missing pantry name', async () => {
      await expect(
        service.getPantryStats([
          'Community Food Pantry Downtown',
          'Fake Pantry',
        ]),
      ).rejects.toThrow('Pantries not found: Fake Pantry');
    });

    it('returns accurate aggregated stats for pantry with orders (Community Food Pantry Downtown)', async () => {
      const stats = (
        await service.getPantryStats(['Community Food Pantry Downtown'])
      )[0];

      expect(stats.pantryId).toBe(1);
      expect(stats.totalItems).toBe(125);
      expect(stats.totalOz).toBeCloseTo(2320.05, 2);
      expect(stats.totalLbs).toBeCloseTo(145.0, 2);
      expect(stats.totalDonatedFoodValue).toBeCloseTo(625.0, 2);
      expect(stats.totalValue).toBeCloseTo(645.0, 2);
      expect(stats.percentageFoodRescueItems).toBe(0);
    });

    it('returns zeroed stats for a pantry with no orders (Riverside Food Assistance)', async () => {
      const stats = (
        await service.getPantryStats(['Riverside Food Assistance'])
      )[0];

      expect(stats.pantryId).toBe(4);
      expect(stats.totalItems).toBe(0);
      expect(stats.totalOz).toBe(0);
      expect(stats.totalLbs).toBe(0);
      expect(stats.totalDonatedFoodValue).toBe(0);
      expect(stats.totalShippingCost).toBe(0);
      expect(stats.totalValue).toBe(0);
      expect(stats.percentageFoodRescueItems).toBe(0);
    });

    it('respects year filter and returns zeros for a non-matching year', async () => {
      const stats = (
        await service.getPantryStats(['Community Food Pantry Downtown'], [2030])
      )[0];

      expect(stats.pantryId).toBe(1);
      expect(stats.totalItems).toBe(0);
      expect(stats.totalOz).toBe(0);
      expect(stats.totalDonatedFoodValue).toBe(0);
    });
  });

  describe('getPantryStats', () => {
    it('filters by pantry name correctly and returns accurate sums', async () => {
      const stats = await service.getPantryStats([
        'Community Food Pantry Downtown',
        'Westside Community Kitchen',
      ]);
      expect(stats.length).toBe(2);

      const community = stats.find((s) => s.pantryId === 1);
      const westside = stats.find((s) => s.pantryId === 2);

      expect(community).toBeDefined();
      expect(community?.totalItems).toBe(125);
      expect(community?.totalOz).toBeCloseTo(2320.05, 2);

      expect(westside).toBeDefined();
      expect(westside?.totalItems).toBe(65);
      expect(westside?.totalOz).toBeCloseTo(1195.0, 2);
    });

    it('accepts single pantry name as string', async () => {
      const stats = await service.getPantryStats([
        'Community Food Pantry Downtown',
      ]);
      expect(stats.length).toBe(1);
      expect(stats[0].pantryId).toBe(1);
    });

    it('pagination beyond range returns empty array', async () => {
      const paged = await service.getPantryStats(undefined, undefined, 100);
      expect(paged.length).toBe(0);
    });

    it('filters by year correctly (no results for future year)', async () => {
      const yearFiltered = await service.getPantryStats(undefined, [2030]);
      expect(yearFiltered.every((s) => s.totalItems === 0)).toBe(true);
    });

    it('pagination page returns first 10 items', async () => {
      for (let i = 0; i < 10; i++) {
        await service.addPantry({
          contactFirstName: `Bulk${i}`,
          contactLastName: 'Tester',
          contactEmail: `bulk${i}@example.com`,
          contactPhone: '555-000-0000',
          hasEmailContact: false,
          pantryName: `BulkTest Pantry ${i}`,
          shipmentAddressLine1: '1 Bulk St',
          shipmentAddressCity: 'Testville',
          shipmentAddressState: 'TS',
          shipmentAddressZip: '00000',
          mailingAddressLine1: '1 Bulk St',
          mailingAddressCity: 'Testville',
          mailingAddressState: 'TS',
          mailingAddressZip: '00000',
          allergenClients: 'none',
          restrictions: ['none'],
          refrigeratedDonation: RefrigeratedDonation.NO,
          acceptFoodDeliveries: false,
          reserveFoodForAllergic: ReserveFoodForAllergic.NO,
          dedicatedAllergyFriendly: false,
          activities: [Activity.CREATE_LABELED_SHELF],
          itemsInStock: 'none',
          needMoreOptions: 'none',
        } as PantryApplicationDto);
      }

      const page1 = await service.getPantryStats(undefined, undefined, 1);
      expect(page1.length).toBe(10);
    });

    it('year filter isolates orders by year (move one delivered order to 2025)', async () => {
      await testDataSource.query(`
        UPDATE public.orders
        SET created_at = '2025-01-16 09:00:00'
        WHERE order_id = (
          SELECT o.order_id FROM public.orders o
          JOIN public.food_requests r ON o.request_id = r.request_id
          WHERE r.pantry_id = (
            SELECT pantry_id FROM public.pantries WHERE pantry_name = 'Community Food Pantry Downtown' LIMIT 1
          ) AND o.status = 'delivered'
          ORDER BY o.order_id DESC
          LIMIT 1
        )
      `);

      const res = await service.getPantryStats(undefined, [2025]);
      const community = res.find((s) => s.pantryId === 1);
      expect(community).toBeDefined();
      expect(community!.totalItems).toBe(40);
      expect(community!.totalDonatedFoodValue).toBeCloseTo(130.0, 2);
    });
  });

  describe('getTotalStats', () => {
    it('aggregates stats across all pantries and matches migration sums', async () => {
      const total = await service.getTotalStats();

      expect(total.totalItems).toBe(220);
      expect(total.totalOz).toBeCloseTo(4530.05, 2);
      expect(total.totalLbs).toBeCloseTo(283.13, 2);
      expect(total.totalDonatedFoodValue).toBeCloseTo(1087.5, 2);
      expect(total.totalShippingCost).toBeCloseTo(60.0, 2);
      expect(total.totalValue).toBeCloseTo(1147.5, 2);
    });

    it('respects year filter and returns zeros for non-matching years', async () => {
      const totalEmpty = await service.getTotalStats([2030]);
      expect(totalEmpty.totalItems).toBe(0);
      expect(totalEmpty.totalOz).toBe(0);
      expect(totalEmpty.totalLbs).toBe(0);
      expect(totalEmpty.totalDonatedFoodValue).toBe(0);
      expect(totalEmpty.totalShippingCost).toBe(0);
      expect(totalEmpty.totalValue).toBe(0);
      expect(totalEmpty.percentageFoodRescueItems).toBe(0);
    });
  });

  describe('findByIds', () => {
    it('findByIds success', async () => {
      const found = await service.findByIds([1, 2]);
      expect(found.map((p) => p.pantryId)).toEqual([1, 2]);
    });

    it('findByIds with some non-existent IDs throws NotFoundException', async () => {
      await expect(service.findByIds([1, 9999])).rejects.toThrow(
        new NotFoundException('Pantries not found: 9999'),
      );
    });
  });

  describe('findByUserId', () => {
    it('findByUserId success', async () => {
      const pantry = await service.findOne(1);
      const userId = pantry.pantryUser.id;
      const result = await service.findByUserId(userId);
      expect(result.pantryId).toBe(1);
    });

    it('findByUserId with non-existent user throws NotFoundException', async () => {
      await expect(service.findByUserId(9999)).rejects.toThrow(
        new NotFoundException('Pantry for User 9999 not found'),
      );
    });
  });
});
