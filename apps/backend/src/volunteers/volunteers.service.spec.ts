import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { User } from '../users/users.entity';
import { VolunteersService } from './volunteers.service';
import { Pantry } from '../pantries/pantries.entity';
import { testDataSource } from '../config/typeormTestDataSource';
import { UsersService } from '../users/users.service';
import { PantriesService } from '../pantries/pantries.service';
import { Order } from '../orders/order.entity';
import { RequestsService } from '../foodRequests/request.service';
import { FoodRequest } from '../foodRequests/request.entity';
import { AuthService } from '../auth/auth.service';
import { EmailsService } from '../emails/email.service';
import { FoodManufacturer } from '../foodManufacturers/manufacturers.entity';
import { DonationItem } from '../donationItems/donationItems.entity';
import { Donation } from '../donations/donations.entity';
import { FoodManufacturersService } from '../foodManufacturers/manufacturers.service';
import { OrdersService } from '../orders/order.service';
import { DonationItemsService } from '../donationItems/donationItems.service';
import { AllocationsService } from '../allocations/allocations.service';
import { DonationService } from '../donations/donations.service';
import { Allocation } from '../allocations/allocations.entity';
import { mock } from 'jest-mock-extended';

const mockEmailsService = mock<EmailsService>();

jest.setTimeout(60000);

describe('VolunteersService', () => {
  let service: VolunteersService;

  beforeAll(async () => {
    if (!testDataSource.isInitialized) {
      await testDataSource.initialize();
    }
    await testDataSource.query(`DROP SCHEMA IF EXISTS public CASCADE`);
    await testDataSource.query(`CREATE SCHEMA public`);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VolunteersService,
        UsersService,
        PantriesService,
        RequestsService,
        OrdersService,
        FoodManufacturersService,
        DonationItemsService,
        AllocationsService,
        DonationService,
        {
          provide: DataSource,
          useValue: testDataSource,
        },
        {
          provide: AuthService,
          useValue: {
            adminCreateUser: jest.fn().mockResolvedValue('test-sub'),
          },
        },
        {
          provide: EmailsService,
          useValue: mockEmailsService,
        },
        {
          provide: getRepositoryToken(User),
          useValue: testDataSource.getRepository(User),
        },
        {
          provide: getRepositoryToken(Pantry),
          useValue: testDataSource.getRepository(Pantry),
        },
        {
          provide: getRepositoryToken(Order),
          useValue: testDataSource.getRepository(Order),
        },
        {
          provide: getRepositoryToken(FoodRequest),
          useValue: testDataSource.getRepository(FoodRequest),
        },
        {
          provide: getRepositoryToken(FoodManufacturer),
          useValue: testDataSource.getRepository(FoodManufacturer),
        },
        {
          provide: getRepositoryToken(DonationItem),
          useValue: testDataSource.getRepository(DonationItem),
        },
        {
          provide: getRepositoryToken(Donation),
          useValue: testDataSource.getRepository(Donation),
        },
        {
          provide: getRepositoryToken(Allocation),
          useValue: testDataSource.getRepository(Allocation),
        },
      ],
    }).compile();

    service = module.get<VolunteersService>(VolunteersService);
  });

  beforeEach(async () => {
    await testDataSource.query(`DROP SCHEMA IF EXISTS public CASCADE`);
    await testDataSource.query(`CREATE SCHEMA public`);
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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should return a volunteer by id', async () => {
      const volunteerId = 6;
      const result = await service.findOne(volunteerId);

      expect(result).toBeDefined();
      expect(result.id).toBe(6);
    });

    it('should throw NotFoundException when volunteer is not found', async () => {
      await expect(service.findOne(999)).rejects.toThrow(
        new NotFoundException('Volunteer 999 not found'),
      );
    });

    it('should throw a NotFoundException when a non-volunteer is found', async () => {
      await expect(service.findOne(1)).rejects.toThrow(
        new NotFoundException('User 1 is not a volunteer'),
      );
    });
  });

  describe('getVolunteersAndPantryAssignments', () => {
    it('returns only admins when there are no volunteers', async () => {
      await testDataSource.query(`DELETE FROM allocations`);
      await testDataSource.query(`DELETE FROM orders`);
      await testDataSource.query(
        `DELETE FROM "users" WHERE role = 'volunteer'`,
      );

      const result = await service.getVolunteersAndPantryAssignments();

      expect(result).toEqual([
        {
          id: 1,
          firstName: 'John',
          lastName: 'Smith',
          email: 'john.smith@ssf.org',
          phone: '555-010-0101',
          role: 'admin',
          userCognitoSub: '',
          active: true,
          pantryIds: [],
        },
        {
          id: 2,
          firstName: 'Sarah',
          lastName: 'Johnson',
          email: 'sarah.j@ssf.org',
          phone: '555-010-0102',
          role: 'admin',
          userCognitoSub: '',
          active: true,
          pantryIds: [],
        },
      ]);
    });

    it('returns all volunteers and admins with their pantry assignments', async () => {
      const result = await service.getVolunteersAndPantryAssignments();

      expect(result.length).toEqual(6);
      expect(result).toEqual([
        {
          id: 1,
          firstName: 'John',
          lastName: 'Smith',
          email: 'john.smith@ssf.org',
          phone: '555-010-0101',
          role: 'admin',
          userCognitoSub: '',
          active: true,
          pantryIds: [],
        },
        {
          id: 2,
          firstName: 'Sarah',
          lastName: 'Johnson',
          email: 'sarah.j@ssf.org',
          phone: '555-010-0102',
          role: 'admin',
          userCognitoSub: '',
          active: true,
          pantryIds: [],
        },
        {
          id: 6,
          firstName: 'James',
          lastName: 'Thomas',
          email: 'james.t@volunteer.org',
          phone: '555-040-0401',
          role: 'volunteer',
          userCognitoSub: '',
          active: true,
          pantryIds: [1],
        },
        {
          id: 7,
          firstName: 'Maria',
          lastName: 'Garcia',
          email: 'maria.g@volunteer.org',
          phone: '555-040-0402',
          role: 'volunteer',
          userCognitoSub: '',
          active: true,
          pantryIds: [2, 3],
        },
        {
          id: 8,
          firstName: 'William',
          lastName: 'Moore',
          email: 'william.m@volunteer.org',
          phone: '555-040-0403',
          role: 'volunteer',
          userCognitoSub: '',
          active: true,
          pantryIds: [3],
        },
        {
          id: 9,
          firstName: 'Patricia',
          lastName: 'Jackson',
          email: 'patricia.j@volunteer.org',
          phone: '555-040-0404',
          role: 'volunteer',
          userCognitoSub: '',
          active: true,
          pantryIds: [1],
        },
      ]);
    });
  });

  describe('getVolunteerPantries', () => {
    it('returns an empty array when volunteer has no pantry assignments', async () => {
      await testDataSource.query(
        `DELETE FROM "volunteer_assignments" WHERE volunteer_id = 6`,
      );

      const result = await service.getVolunteerPantries(6);

      expect(result).toEqual([]);
    });

    it('returns all pantries assigned to a volunteer', async () => {
      const result = await service.getVolunteerPantries(7);

      expect(result).toHaveLength(2);

      const pantryIds = result.map((p) => p.pantryId);
      expect(pantryIds).toEqual([2, 3]);
    });
  });

  describe('findRequestsByVolunteer', () => {
    it('returned requests include pantry info', async () => {
      const requests = await service.findRequestsByVolunteer(7);
      requests.forEach((request) => {
        expect(request.pantry).toBeDefined();
        expect(request.pantry).toHaveProperty('pantryName');
      });
    });

    it('returns requests only from assigned pantries', async () => {
      const volunteerId = 6;

      const assignedPantries = await service.getVolunteerPantries(volunteerId);
      const assignedPantryIds = assignedPantries.map((p) => p.pantryId);

      const requests = await service.findRequestsByVolunteer(volunteerId);
      requests.forEach((request) => {
        expect(assignedPantryIds).toContain(request.pantry.pantryId);
      });
    });

    it('returns empty array when volunteer has no assigned pantries', async () => {
      const volunteerId = await testDataSource
        .query(
          `
        INSERT INTO users (first_name, last_name, email, phone, role)
        VALUES ('Test', 'Volunteer', 'test@volunteer.com', '537-280-1238', 'volunteer')
        RETURNING user_id
      `,
        )
        .then((rows) => rows[0].user_id);

      const result = await service.findRequestsByVolunteer(volunteerId);
      expect(result).toEqual([]);
    });

    it('returns empty array when assigned pantries have no requests', async () => {
      const volunteerId = 8;

      const assignedPantries = await service.getVolunteerPantries(volunteerId);
      const assignedPantryIds = assignedPantries.map((p) => p.pantryId);
      await testDataSource.query(
        `DELETE FROM allocations
      WHERE order_id IN (
        SELECT o.order_id FROM orders o
        JOIN food_requests fr ON o.request_id = fr.request_id
        WHERE fr.pantry_id = ANY($1)
      )`,
        [assignedPantryIds],
      );
      await testDataSource.query(
        `DELETE FROM orders
      WHERE request_id IN (
        SELECT request_id FROM food_requests WHERE pantry_id = ANY($1)
      )`,
        [assignedPantryIds],
      );
      await testDataSource.query(
        `DELETE FROM food_requests WHERE pantry_id = ANY($1)`,
        [assignedPantryIds],
      );

      const requests = await service.findRequestsByVolunteer(volunteerId);
      expect(requests).toEqual([]);
    });
  });

  describe('getRecentOrders', () => {
    it('returns empty array when volunteer has no assigned orders', async () => {
      await testDataSource.query(
        `UPDATE orders SET assignee_id = (SELECT user_id FROM users WHERE role = 'volunteer' AND user_id != 6 LIMIT 1)`,
      );

      const result = await service.getRecentOrders(6);
      expect(result).toEqual([]);
    });

    it('returns at most 2 orders even when volunteer has more', async () => {
      await testDataSource.query(`UPDATE orders SET assignee_id = 6`);

      const result = await service.getRecentOrders(6);
      expect(result).toHaveLength(2);
    });

    it('returns correct shape of orders for the volunteer', async () => {
      await testDataSource.query(`UPDATE orders SET assignee_id = 6`);

      const result = await service.getRecentOrders(6);

      expect(result[0].createdAt >= result[1].createdAt).toBe(true);
      result.forEach((order) => {
        expect(order.pantryName).toBeDefined();
        expect(order.assignee.id).toBe(6);
        expect(order.assignee.firstName).toBe('James');
        expect(order.assignee.lastName).toBe('Thomas');
        expect(order.orderId).toBeDefined();
        expect(order.status).toBeDefined();
        expect(order.createdAt).toBeDefined();
        expect(order.shippedAt).toBeDefined();
        expect(order.deliveredAt).toBeDefined();
      });
    });

    it('throws when volunteer does not exist', async () => {
      await expect(service.getRecentOrders(999)).rejects.toThrow(
        new NotFoundException('Volunteer 999 not found'),
      );
    });
  });

  describe('getVolunteerDashboardStats', () => {
    it('throws NotFoundException for non-existent volunteer', async () => {
      await expect(service.getVolunteerDashboardStats(999)).rejects.toThrow(
        new NotFoundException('Volunteer 999 not found'),
      );
    });

    it('counts food requests from assigned pantries, with zero orders/donations when none are assigned', async () => {
      // Maria Garcia (id=7) is assigned to pantries 2 and 3, each with 1 food request
      await testDataSource.query(`UPDATE orders SET assignee_id = NULL`);

      const stats = await service.getVolunteerDashboardStats(7);

      const expectedKeys = ['Food Requests', 'Orders', 'Donations'];
      expect(Object.keys(stats)).toEqual(expectedKeys);

      Object.values(stats).forEach((value) => {
        expect(typeof value).toBe('string');
      });

      expect(stats).toEqual({
        'Food Requests': '2',
        Orders: '0',
        Donations: '0',
      });
    });

    it('returns zero stats when the volunteer has no pantry or order assignments', async () => {
      await testDataSource.query(
        `DELETE FROM "volunteer_assignments" WHERE volunteer_id = 8`,
      );
      await testDataSource.query(`UPDATE orders SET assignee_id = NULL`);

      const stats = await service.getVolunteerDashboardStats(8);

      expect(stats).toEqual({
        'Food Requests': '0',
        Orders: '0',
        Donations: '0',
      });
    });

    it('counts orders assigned to the volunteer and the unique donations behind them', async () => {
      // James Thomas (id=6) is assigned to pantry 1 only (2 food requests),
      // but all 4 seeded orders (spanning 4 distinct donations) are assigned to him
      await testDataSource.query(`UPDATE orders SET assignee_id = 6`);

      const stats = await service.getVolunteerDashboardStats(6);

      expect(stats).toEqual({
        'Food Requests': '2',
        Orders: '4',
        Donations: '4',
      });
    });

    it('counts orders/donations assigned directly to the volunteer even outside their assigned pantries', async () => {
      // Maria Garcia (id=7) is assigned to pantries 2 and 3, not pantry 1,
      // but is directly assigned the delivered order under pantry 1
      await testDataSource.query(`UPDATE orders SET assignee_id = NULL`);
      await testDataSource.query(
        `UPDATE orders SET assignee_id = 7 WHERE shipped_at = '2024-01-17 08:00:00'`,
      );

      const stats = await service.getVolunteerDashboardStats(7);

      expect(stats).toEqual({
        'Food Requests': '2',
        Orders: '1',
        Donations: '1',
      });
    });

    it('counts a shared donation only once across multiple assigned orders', async () => {
      // William Moore (id=8) is assigned to pantry 3 only (1 food request).
      // Assign him the Westside order (donation D2 only) and the pending
      // Downtown order (donations D4 and D2) - D2 should only count once.
      await testDataSource.query(`UPDATE orders SET assignee_id = NULL`);
      await testDataSource.query(
        `UPDATE orders SET assignee_id = 8 WHERE shipped_at = '2024-01-22 09:00:00'`,
      );
      await testDataSource.query(
        `UPDATE orders SET assignee_id = 8 WHERE created_at = '2024-02-03 12:00:00' AND status = 'pending'`,
      );

      const stats = await service.getVolunteerDashboardStats(8);

      expect(stats).toEqual({
        'Food Requests': '1',
        Orders: '2',
        Donations: '2',
      });
    });
  });
});
