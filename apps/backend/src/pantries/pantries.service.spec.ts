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

// database helpers
import { testDataSource } from '../config/typeormTestDataSource';
import { Order } from '../orders/order.entity';
import { OrdersService } from '../orders/order.service';
import { FoodRequest } from '../foodRequests/request.entity';
import { RequestsService } from '../foodRequests/request.service';

// This spec uses the migration-populated dummy data to exercise
// PantriesService against a real database.  Each test resets the
// schema to guarantee isolation.

describe('PantriesService (integration using dummy data)', () => {
  let service: PantriesService;
  let ordersService: OrdersService;

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
    ordersService = module.get<OrdersService>(OrdersService);
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

  describe('approve/deny', () => {
    it('approves a pending pantry', async () => {
      await service.approve(5);
      const p = await service.findOne(5);
      expect(p.status).toBe('approved');
    });

    it('denies a pending pantry', async () => {
      await service.deny(6);
      const p = await service.findOne(6);
      expect(p.status).toBe('denied');
    });

    it('throws when approving non-existent', async () => {
      await expect(service.approve(9999)).rejects.toThrow(
        new NotFoundException('Pantry 9999 not found'),
      );
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
      } as PantryApplicationDto;

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

  describe('getStatsForPantry', () => {
    it('returns meaningful stats for pantry with orders', async () => {
      const pantry = await service.findOne(1);
      const stats = await service.getStatsForPantry(pantry);
      expect(stats.totalItems).toBeGreaterThan(0);
      expect(stats.totalOz).toBeGreaterThan(0);
      expect(stats.pantryId).toBe(1);
    });
  });

  describe('getPantryStats', () => {
    it('filters by pantry name correctly', async () => {
      const stats = await service.getPantryStats([
        'Community Food Pantry Downtown',
      ]);
      expect(stats.length).toBe(1);
      expect(stats[0].pantryId).toBe(1);
    });

    it('handles pagination', async () => {
      const paged = await service.getPantryStats(undefined, undefined, 1);
      expect(paged.length).toBeGreaterThanOrEqual(1);
    });

    it('filters by year correctly', async () => {
      const yearFiltered = await service.getPantryStats(undefined, [2030]);
      expect(yearFiltered.every((s) => s.totalItems === 0)).toBe(true);
    });
  });

  describe('getTotalStats', () => {
    it('aggregates stats across all pantries', async () => {
      const total = await service.getTotalStats();
      expect(total.totalItems).toBeGreaterThan(0);
    });

    it('respects year filter', async () => {
      const totalEmpty = await service.getTotalStats([2030]);
      expect(totalEmpty.totalItems).toBe(0);
    });
  });

  it('findByIds success and failure', async () => {
    const found = await service.findByIds([1, 2]);
    expect(found.map((p) => p.pantryId)).toEqual([1, 2]);
    await expect(service.findByIds([1, 9999])).rejects.toThrow();
  });

  it('findByUserId success and failure', async () => {
    const res: any[] = await testDataSource.query(
      `SELECT user_id FROM public.users WHERE email='pantry1@ssf.org' LIMIT 1`,
    );
    const userId = res[0].user_id;
    const pantry = await service.findByUserId(userId);
    expect(pantry.pantryId).toBe(1);
    await expect(service.findByUserId(999999)).rejects.toThrow();
  });
});
