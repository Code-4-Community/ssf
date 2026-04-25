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
import { OrdersService } from '../orders/order.service';
import { FoodManufacturersService } from '../foodManufacturers/manufacturers.service';
import { DonationItemsService } from '../donationItems/donationItems.service';
import { AllocationsService } from '../allocations/allocations.service';
import { DonationService } from '../donations/donations.service';
import { Allocation } from '../allocations/allocations.entity';

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
          useValue: {
            sendEmails: jest.fn().mockResolvedValue(undefined),
          },
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
    it('returns an empty array when there are no volunteers', async () => {
      await testDataSource.query(`DELETE FROM allocations`);
      await testDataSource.query(`DELETE FROM orders`);
      await testDataSource.query(
        `DELETE FROM "users" WHERE role = 'volunteer'`,
      );

      const result = await service.getVolunteersAndPantryAssignments();

      expect(result).toEqual([]);
    });

    it('returns all volunteers with their pantry assignments', async () => {
      const result = await service.getVolunteersAndPantryAssignments();

      expect(result.length).toEqual(4);
      expect(result).toEqual([
        {
          id: 6,
          firstName: 'James',
          lastName: 'Thomas',
          email: 'james.t@volunteer.org',
          phone: '555-040-0401',
          role: 'volunteer',
          userCognitoSub: '',
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

  describe('assignPantriesToVolunteer', () => {
    it('assigns new pantries to a volunteer with existing assignments', async () => {
      const beforeAssignment = await service.getVolunteerPantries(7);
      expect(beforeAssignment).toHaveLength(2);
      const beforePantryIds = beforeAssignment.map((p) => p.pantryId);
      expect(beforePantryIds).toEqual([2, 3]);

      const result = await service.assignPantriesToVolunteer(7, [1, 4]);
      expect(result.pantries).toHaveLength(4);
      const afterPantryIds = result.pantries?.map((p) => p.pantryId);
      expect(afterPantryIds).toEqual([2, 3, 1, 4]);
    });

    it('assigns pantries to a volunteer with no existing assignments', async () => {
      await testDataSource.query(
        `DELETE FROM "volunteer_assignments" WHERE volunteer_id = 6`,
      );

      const beforeAssignment = await service.getVolunteerPantries(6);
      expect(beforeAssignment).toEqual([]);

      const result = await service.assignPantriesToVolunteer(6, [2, 3]);
      expect(result.pantries).toHaveLength(2);
      const pantryIds = result.pantries?.map((p) => p.pantryId);
      expect(pantryIds).toEqual([2, 3]);
    });

    it('does not contain duplicate pantry assignments when called with ones that already exist', async () => {
      const beforeAssignment = await service.getVolunteerPantries(7);
      expect(beforeAssignment).toHaveLength(2);
      const beforePantryIds = beforeAssignment.map((p) => p.pantryId);
      expect(beforePantryIds).toEqual([2, 3]);

      const result = await service.assignPantriesToVolunteer(7, [2, 3]);
      expect(result.pantries).toHaveLength(2);
      const pantryIds = result.pantries?.map((p) => p.pantryId);
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
  });
});
