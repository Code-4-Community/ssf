import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FoodRequest } from './request.entity';
import { RequestsService } from './request.service';
import { Pantry } from '../pantries/pantries.entity';
import { FoodRequestStatus, RequestSize } from './types';
import { Order } from '../orders/order.entity';
import { OrderStatus } from '../orders/types';
import { FoodManufacturer } from '../foodManufacturers/manufacturers.entity';
import { FoodType } from '../donationItems/types';
import { DonationItem } from '../donationItems/donationItems.entity';
import { testDataSource } from '../config/typeormTestDataSource';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { EmailsService } from '../emails/email.service';
import { mock } from 'jest-mock-extended';
import { emailTemplates } from '../emails/emailTemplates';
import { Allocation } from '../allocations/allocations.entity';
import { ApplicationStatus } from '../shared/types';
import { User } from '../users/users.entity';
import { UsersService } from '../users/users.service';
import { Donation } from '../donations/donations.entity';
import { AuthService } from '../auth/auth.service';
import { PantriesService } from '../pantries/pantries.service';
import { FoodManufacturersService } from '../foodManufacturers/manufacturers.service';

jest.setTimeout(60000);

const mockEmailsService = mock<EmailsService>();

describe('RequestsService', () => {
  let service: RequestsService;

  beforeAll(async () => {
    mockEmailsService.sendEmails.mockResolvedValue(undefined);

    if (!testDataSource.isInitialized) {
      await testDataSource.initialize();
    }

    const module = await Test.createTestingModule({
      providers: [
        RequestsService,
        UsersService,
        PantriesService,
        FoodManufacturersService,
        {
          provide: getRepositoryToken(FoodRequest),
          useValue: testDataSource.getRepository(FoodRequest),
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
          provide: getRepositoryToken(FoodManufacturer),
          useValue: testDataSource.getRepository(FoodManufacturer),
        },
        {
          provide: getRepositoryToken(DonationItem),
          useValue: testDataSource.getRepository(DonationItem),
        },
        {
          provide: getRepositoryToken(Allocation),
          useValue: testDataSource.getRepository(Allocation),
        },
        {
          provide: getRepositoryToken(User),
          useValue: testDataSource.getRepository(User),
        },
        {
          provide: getRepositoryToken(Donation),
          useValue: testDataSource.getRepository(Donation),
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
      ],
    }).compile();

    service = module.get<RequestsService>(RequestsService);
  });

  beforeEach(async () => {
    mockEmailsService.sendEmails.mockClear();
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

  describe('getAll', () => {
    it('should return all requests with request details, pantryId, and pantryName', async () => {
      const result = await service.getAll();
      expect(result).toHaveLength(4);
      result.forEach((r) => {
        expect(r.requestId).toBeDefined();
        expect(r.requestedSize).toBeDefined();
        expect(r.requestedFoodTypes).toBeDefined();
        expect(r.additionalInformation).toBeDefined();
        expect(r.requestedAt).toBeDefined();
        expect(r.status).toBeDefined();
        expect(r.pantry.pantryId).toBeDefined();
        expect(r.pantry.pantryName).toBeDefined();
      });

      const sorted = [...result].sort((a, b) => a.requestId - b.requestId);
      const firstRequest = sorted[0];
      expect(firstRequest.requestedSize).toBe(RequestSize.LARGE);
      expect(firstRequest.requestedFoodTypes).toEqual([
        FoodType.SPREADS_SEED_BUTTERS,
        FoodType.GLUTEN_FREE_BREAD,
        FoodType.DRIED_BEANS,
        FoodType.DAIRY_FREE_ALTERNATIVES,
      ]);
      expect(firstRequest.additionalInformation).toBe(
        'We have 150 families to serve this week. Need extra allergen-free options.',
      );
      expect(firstRequest.status).toBe(FoodRequestStatus.ACTIVE);
      expect(firstRequest.pantry.pantryId).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return a food request with the corresponding id', async () => {
      const requestId = 1;
      const result = await service.findOne(requestId);
      expect(result).toBeDefined();
      expect(result.requestId).toBe(requestId);
      expect(result.orders).toBeDefined();
      expect(result.orders).toHaveLength(1);
    });

    it('should throw NotFoundException for non-existent request', async () => {
      await expect(service.findOne(999)).rejects.toThrow(
        new NotFoundException('Request 999 not found'),
      );
    });
  });

  describe('getOrderDetails', () => {
    it('should return mapped order details for a valid requestId', async () => {
      const expectedItems = [
        {
          id: 1,
          name: 'Peanut Butter (16oz)',
          quantity: 10,
          foodType: 'Spreads/Seed Butters (Peanut Butter Alternative)',
        },
        {
          id: 3,
          name: 'Canned Green Beans',
          quantity: 5,
          foodType: 'Frozen Meals',
        },
        {
          id: 2,
          name: 'Whole Wheat Bread',
          quantity: 25,
          foodType: 'Gluten-Free Bread',
        },
      ];

      const result = await service.getOrderDetails(1);

      expect(result).toBeDefined();
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        orderId: 1,
        status: OrderStatus.DELIVERED,
        foodManufacturerName: 'FoodCorp Industries',
        trackingLink: 'https://www.samplelink.com/samplelink',
        items: expectedItems,
      });
    });

    it('should throw NotFoundException for non-existent request', async () => {
      await expect(service.getOrderDetails(999)).rejects.toThrow(
        new NotFoundException('Request 999 not found'),
      );
    });

    it('should return empty list if no associated orders', async () => {
      const result = await testDataSource.query(`
        INSERT INTO food_requests (pantry_id, requested_size, requested_food_types, location, requested_at)
        VALUES (
          (SELECT pantry_id FROM pantries LIMIT 1),
          'Small (2-5 boxes)',
          ARRAY[]::food_type_enum[],
          'Boston, MA',
          NOW()
        )
        RETURNING request_id
      `);
      const requestId = result[0].request_id;
      const orderDetails = await service.getOrderDetails(requestId);
      expect(orderDetails).toEqual([]);
    });
  });

  describe('create', () => {
    it('should successfully create and return a new food request', async () => {
      const pantryId = 1;
      const result = await service.create(
        pantryId,
        RequestSize.MEDIUM,
        [FoodType.DRIED_BEANS, FoodType.FROZEN_MEALS],
        'Boston, MA',
        'Additional info',
        'Prior donation was great',
      );
      expect(result).toBeDefined();
      expect(result.pantryId).toBe(pantryId);
      expect(result.requestedSize).toBe(RequestSize.MEDIUM);
      expect(result.requestedFoodTypes).toEqual([
        FoodType.DRIED_BEANS,
        FoodType.FROZEN_MEALS,
      ]);
      expect(result.location).toBe('Boston, MA');
      expect(result.additionalInformation).toBe('Additional info');
      expect(result.feedbackOnPriorDonation).toBe('Prior donation was great');
    });

    it('should successfully create and return new food request w/o additional info', async () => {
      const pantryId = 1;
      const result = await service.create(
        pantryId,
        RequestSize.LARGE,
        [FoodType.GRANOLA, FoodType.GRANOLA_BARS],
        'Boston, MA',
      );
      expect(result).toBeDefined();
      expect(result.pantryId).toBe(pantryId);
      expect(result.requestedSize).toBe(RequestSize.LARGE);
      expect(result.requestedFoodTypes).toEqual([
        FoodType.GRANOLA,
        FoodType.GRANOLA_BARS,
      ]);
      expect(result.additionalInformation).toBeNull();
      expect(result.feedbackOnPriorDonation).toBeNull();
    });

    it('should send food request email to pantry user with volunteers BCCed', async () => {
      const pantryId = 1;
      const pantry = await testDataSource.getRepository(Pantry).findOne({
        where: { pantryId },
        relations: ['pantryUser', 'volunteers'],
      });

      await service.create(
        pantryId,
        RequestSize.MEDIUM,
        [FoodType.DRIED_BEANS, FoodType.FROZEN_MEALS],
        'Boston, MA',
      );

      if (!pantry) throw new Error('Missing pantry test object');
      const message = emailTemplates.pantrySubmitsFoodRequest({
        pantryName: pantry.pantryName,
      });
      const volunteerEmails = (pantry.volunteers ?? []).map((v) => v.email);

      expect(mockEmailsService.sendEmails).toHaveBeenCalledTimes(1);
      expect(mockEmailsService.sendEmails).toHaveBeenCalledWith({
        toEmail: pantry.pantryUser.email,
        subject: message.subject,
        bodyHtml: message.bodyHTML,
        bccEmails: volunteerEmails,
      });
    });

    it('should not send email when pantry has no volunteers', async () => {
      // update the database so that approved pantry 2 has no volunteers
      const pantryId = 2;
      await testDataSource.query(`
        DELETE FROM volunteer_assignments WHERE pantry_id = ${pantryId}
      `);

      const pantry = await testDataSource.getRepository(Pantry).findOne({
        where: { pantryId },
        relations: ['pantryUser', 'volunteers'],
      });

      await service.create(
        pantryId,
        RequestSize.MEDIUM,
        [FoodType.DRIED_BEANS, FoodType.FROZEN_MEALS],
        'Boston, MA',
      );

      if (!pantry) throw new Error('Missing pantry test object');
      const volunteerEmails = (pantry.volunteers ?? []).map((v) => v.email);

      expect(volunteerEmails).toEqual([]);
      expect(mockEmailsService.sendEmails).not.toHaveBeenCalled();
    });

    it('should still save food request to database if email send fails', async () => {
      mockEmailsService.sendEmails.mockRejectedValueOnce(
        new Error('Email failed'),
      );

      const pantryId = 1;
      await expect(
        service.create(
          pantryId,
          RequestSize.MEDIUM,
          [FoodType.DRIED_BEANS],
          'Boston, MA',
        ),
      ).rejects.toThrow(
        new InternalServerErrorException(
          'Failed to send new food request notification email to volunteers',
        ),
      );

      const requests = await service.findAllForPantry(pantryId);
      expect(requests.length).toBe(3);
    });

    it('should throw NotFoundException for non-existent pantry', async () => {
      await expect(
        service.create(
          999,
          RequestSize.MEDIUM,
          [FoodType.DRIED_BEANS, FoodType.FROZEN_MEALS],
          'Boston, MA',
          'Additional info',
        ),
      ).rejects.toThrow(new NotFoundException('Pantry 999 not found'));
    });

    it('should throw ConflictException for denied pantry', async () => {
      await expect(
        service.create(
          4,
          RequestSize.MEDIUM,
          [FoodType.DRIED_BEANS, FoodType.FROZEN_MEALS],
          'Boston, MA',
          'Additional info',
        ),
      ).rejects.toThrow(new ConflictException('Pantry 4 not approved'));
    });

    it('should throw ConflictException for pending pantry', async () => {
      await expect(
        service.create(
          5,
          RequestSize.MEDIUM,
          [FoodType.DRIED_BEANS, FoodType.FROZEN_MEALS],
          'Boston, MA',
          'Additional info',
        ),
      ).rejects.toThrow(new ConflictException('Pantry 5 not approved'));
    });
  });

  describe('findAllForPantry', () => {
    it('should return all food requests for a specific pantry with pantry details', async () => {
      const pantryId = 1;
      const result = await service.findAllForPantry(pantryId);

      expect(result).toBeDefined();
      expect(result).toHaveLength(2);
      expect(result.every((r) => r.pantry.pantryId === pantryId)).toBe(true);
      expect(result.every((r) => r.pantry)).toBeDefined();
    });

    it('should return empty array for pantry with no requests', async () => {
      const pantryId = 5;
      const result = await service.findAllForPantry(pantryId);

      expect(result).toBeDefined();
      expect(result).toEqual([]);
    });
  });

  describe('updateRequestStatus', () => {
    it('should update request status to closed since all orders are delivered', async () => {
      const requestId = 1;

      await service.updateRequestStatus(requestId);

      const request = await service.findOne(requestId);
      expect(request.status).toBe(FoodRequestStatus.CLOSED);
    });

    it('should close the request when its orders are a mix of delivered and closed', async () => {
      const requestId = 1;
      const orderRepo = testDataSource.getRepository(Order);

      // Seed request 1 has a single delivered order. Add a second, closed order
      // so the request has one of each terminal status to exercise the
      // delivered-or-closed "all complete" check.
      const [deliveredOrder] = await orderRepo.find({ where: { requestId } });
      expect(deliveredOrder.status).toBe(OrderStatus.DELIVERED);

      await orderRepo.save(
        orderRepo.create({
          requestId,
          foodManufacturerId: deliveredOrder.foodManufacturerId,
          assigneeId: deliveredOrder.assigneeId,
          status: OrderStatus.CLOSED,
        }),
      );

      const orders = await orderRepo.find({ where: { requestId } });
      expect(orders.map((o) => o.status).sort()).toEqual(
        [OrderStatus.CLOSED, OrderStatus.DELIVERED].sort(),
      );

      await service.updateRequestStatus(requestId);

      const request = await service.findOne(requestId);
      expect(request.status).toBe(FoodRequestStatus.CLOSED);
    });

    it('should update request status to active since all orders are not delivered', async () => {
      const requestId = 3;

      await service.updateRequestStatus(requestId);

      const request = await service.findOne(requestId);
      expect(request.status).toBe(FoodRequestStatus.ACTIVE);
    });

    it('should throw BadRequestException for request with no orders', async () => {
      const pantryId = 1;
      const result = await service.create(
        pantryId,
        RequestSize.MEDIUM,
        [FoodType.DRIED_BEANS, FoodType.FROZEN_MEALS],
        'Boston, MA',
      );
      const requestId = result.requestId;

      await expect(service.updateRequestStatus(requestId)).rejects.toThrow(
        new BadRequestException(
          `Cannot update request ${requestId} with no orders`,
        ),
      );
    });

    it('should throw NotFoundException for non-existent request', async () => {
      const requestId = 999;

      await expect(service.updateRequestStatus(requestId)).rejects.toThrow(
        new NotFoundException('Request 999 not found'),
      );
    });

    it('sends pantry closed email with last delivered order assignee on auto-close', async () => {
      const requestId = 1;
      const pantry = (await testDataSource.getRepository(Pantry).findOne({
        where: { pantryId: 1 },
        relations: ['pantryUser', 'volunteers'],
      })) as Pantry;
      const lastDeliveredOrder = (await testDataSource
        .getRepository(Order)
        .findOne({
          where: { requestId, status: OrderStatus.DELIVERED },
          order: { deliveredAt: 'DESC' },
          relations: ['assignee'],
        })) as Order;

      const requestBefore = await service.findOne(1);
      expect(requestBefore.status).toBe(FoodRequestStatus.ACTIVE);

      await service.updateRequestStatus(requestId);

      const request = await service.findOne(1);
      expect(request.status).toBe(FoodRequestStatus.CLOSED);

      const assignee = lastDeliveredOrder.assignee;
      const expectedMessage = emailTemplates.pantryRequestClosed({
        pantryName: pantry.pantryName,
        volunteerName: `${assignee.firstName} ${assignee.lastName}`,
        volunteerEmail: assignee.email,
      });

      const volunteerEmails = (pantry.volunteers ?? []).map((v) => v.email);

      expect(mockEmailsService.sendEmails).toHaveBeenCalledTimes(1);
      expect(mockEmailsService.sendEmails).toHaveBeenCalledWith({
        toEmail: pantry.pantryUser.email,
        subject: expectedMessage.subject,
        bodyHtml: expectedMessage.bodyHTML,
        bccEmails: volunteerEmails,
      });
    });

    it('does not send email when not all orders are delivered (request stays active)', async () => {
      const request = (await service.findOne(3)) as FoodRequest;

      expect(request.orders).toBeDefined();
      expect(
        request.orders?.some((order) => order.status !== OrderStatus.DELIVERED),
      ).toBe(true);

      await service.updateRequestStatus(3);

      expect(mockEmailsService.sendEmails).not.toHaveBeenCalled();
    });

    it('throws BadRequestException and does not send email when request is already closed', async () => {
      await testDataSource.query(
        `UPDATE food_requests SET status = 'closed' WHERE request_id = 1`,
      );

      const request = await service.findOne(1);
      expect(request.status).toBe(FoodRequestStatus.CLOSED);

      await expect(service.updateRequestStatus(1)).rejects.toThrow(
        new BadRequestException(`Request 1 is already closed`),
      );

      expect(mockEmailsService.sendEmails).not.toHaveBeenCalled();
    });

    it('still auto-closes request when email fails', async () => {
      const requestBefore = await service.findOne(1);
      expect(requestBefore.status).toBe(FoodRequestStatus.ACTIVE);

      mockEmailsService.sendEmails.mockRejectedValueOnce(
        new Error('SMTP error'),
      );

      await expect(service.updateRequestStatus(1)).rejects.toThrow(
        new InternalServerErrorException(
          'Request 1 auto-closed, but failed to send pantry notification email',
        ),
      );

      const request = await service.findOne(1);
      expect(request.status).toBe(FoodRequestStatus.CLOSED);
    });

    it('should not reopen a closed request when updateRequestStatus is called', async () => {
      await service.closeRequest(1, 6);

      await expect(service.updateRequestStatus(1)).rejects.toThrow(
        new BadRequestException(`Request 1 is already closed`),
      );

      const fromDb = await service.findOne(1);
      expect(fromDb.status).toBe(FoodRequestStatus.CLOSED);
    });
  });

  describe('getMatchingManufacturers', () => {
    it('throws NotFoundException when request does not exist', async () => {
      await expect(service.getMatchingManufacturers(999)).rejects.toThrow(
        new NotFoundException('Request 999 not found'),
      );
    });

    it('should not return manufacturers if they are not approved', async () => {
      const requestId = 1;

      const resultBefore = await service.getMatchingManufacturers(requestId);

      const allIdsBefore = [
        ...resultBefore.matchingManufacturers,
        ...resultBefore.nonMatchingManufacturers,
      ].map((fm) => fm.foodManufacturerId);

      expect(allIdsBefore.sort()).toEqual([1, 2]);

      const manufacturerRepo = testDataSource.getRepository(FoodManufacturer);

      const manufacturer = (await manufacturerRepo.findOne({
        where: { foodManufacturerId: 1 },
      })) as FoodManufacturer;

      manufacturer.status = ApplicationStatus.PENDING;

      await manufacturerRepo.save(manufacturer);

      const resultAfter = await service.getMatchingManufacturers(requestId);

      const allIdsAfter = [
        ...resultAfter.matchingManufacturers,
        ...resultAfter.nonMatchingManufacturers,
      ].map((fm) => fm.foodManufacturerId);

      expect(allIdsAfter).toEqual([2]);
    });

    it('should correctly match manufacturers based on requested food types and available stock', async () => {
      const requestId = 1;
      const request = await service.findOne(requestId);
      const result = await service.getMatchingManufacturers(requestId);

      for (const fm of result.matchingManufacturers) {
        const items = await testDataSource.query(
          `
          SELECT 1 FROM donations d
           JOIN donation_items di ON di.donation_id = d.donation_id
           WHERE d.food_manufacturer_id = $1
             AND di.food_type = ANY($2)
             AND di.reserved_quantity < di.quantity
           LIMIT 1
        `,
          [fm.foodManufacturerId, request.requestedFoodTypes],
        );
        expect(items.length).toBe(1);
      }

      for (const fm of result.nonMatchingManufacturers) {
        const items = await testDataSource.query(
          `
          SELECT 1 FROM donations d
           JOIN donation_items di ON di.donation_id = d.donation_id
           WHERE d.food_manufacturer_id = $1
             AND di.food_type = ANY($2)
             AND di.reserved_quantity < di.quantity
           LIMIT 1
        `,
          [fm.foodManufacturerId, request.requestedFoodTypes],
        );
        expect(items.length).toBe(0);
      }
    });

    it('no manufacturer appears in both matchingManufacturers and nonMatchingManufacturers', async () => {
      const requestId = 1;
      const result = await service.getMatchingManufacturers(requestId);

      const matchingIds = result.matchingManufacturers.map(
        (fm) => fm.foodManufacturerId,
      );
      const nonMatchingIds = result.nonMatchingManufacturers.map(
        (fm) => fm.foodManufacturerId,
      );
      const intersection = matchingIds.filter((id) =>
        nonMatchingIds.includes(id),
      );
      expect(intersection).toEqual([]);
    });

    it(`doesn't include manufacturers with no donation items in either list`, async () => {
      const requestId = 1;
      const result = await service.getMatchingManufacturers(requestId);

      for (const fm of [
        ...result.matchingManufacturers,
        ...result.nonMatchingManufacturers,
      ]) {
        const items = await testDataSource.query(
          `
          SELECT 1 FROM donations d
           JOIN donation_items di ON di.donation_id = d.donation_id
           WHERE d.food_manufacturer_id = $1
           LIMIT 1
        `,
          [fm.foodManufacturerId],
        );
        expect(items.length).toBe(1);
      }
    });
  });

  describe('getAvailableItems', () => {
    it('all items belong to the specified manufacturer', async () => {
      const manufacturerId = 1;
      const result = await service.getAvailableItems(1, manufacturerId);
      const allItems = [...result.matchingItems, ...result.nonMatchingItems];

      for (const item of allItems) {
        const donation = await testDataSource.query(
          `
          SELECT 1 FROM donation_items di
          JOIN donations d ON d.donation_id = di.donation_id
          WHERE di.item_id = $1
            AND d.food_manufacturer_id = $2
          LIMIT 1
        `,
          [item.itemId, manufacturerId],
        );
        expect(donation.length).toBe(1);
      }
    });

    it('all items in matchingItems match a requested food type, and all items in nonMatchingItems do not match any requested food types', async () => {
      const requestId = 1;
      const request = await service.findOne(requestId);
      const requestedFoodTypes = request.requestedFoodTypes;

      const result = await service.getAvailableItems(requestId, 1);

      for (const item of result.matchingItems) {
        expect(requestedFoodTypes).toContain(item.foodType);
      }

      for (const item of result.nonMatchingItems) {
        expect(requestedFoodTypes).not.toContain(item.foodType);
      }
    });

    it('no item appears in both matchingItems and nonMatchingItems', async () => {
      const requestId = 1;
      const result = await service.getAvailableItems(requestId, 1);

      const matchingIds = result.matchingItems.map((item) => item.itemId);
      const nonMatchingIds = result.nonMatchingItems.map((item) => item.itemId);
      const intersection = matchingIds.filter((id) =>
        nonMatchingIds.includes(id),
      );
      expect(intersection).toEqual([]);
    });

    it('only returns items where reserved_quantity < quantity', async () => {
      const result = await service.getAvailableItems(1, 1);

      const allItems = [...result.matchingItems, ...result.nonMatchingItems];
      allItems.forEach((item) => {
        expect(item.availableQuantity).toBeGreaterThan(0);
      });
    });

    it('returned items conform to MatchingItemsDto', async () => {
      const result = await service.getAvailableItems(1, 1);

      expect(result).toHaveProperty('matchingItems');
      expect(result).toHaveProperty('nonMatchingItems');
      expect(Array.isArray(result.matchingItems)).toBe(true);
      expect(Array.isArray(result.nonMatchingItems)).toBe(true);

      const allItems = [...result.matchingItems, ...result.nonMatchingItems];

      if (allItems.length > 0) {
        allItems.forEach((item) => {
          expect(item).toHaveProperty('itemId');
          expect(item).toHaveProperty('itemName');
          expect(item).toHaveProperty('foodType');
          expect(item).toHaveProperty('availableQuantity');

          expect(typeof item.itemId).toBe('number');
          expect(typeof item.itemName).toBe('string');
          expect(typeof item.foodType).toBe('string');
          expect(Object.values(FoodType)).toContain(item.foodType);
          expect(typeof item.availableQuantity).toBe('number');
        });
      }
    });

    it('returns empty arrays for no available items', async () => {
      await testDataSource.query(`
        UPDATE donation_items 
        SET reserved_quantity = quantity
      `);

      const result = await service.getAvailableItems(1, 1);

      expect(result.matchingItems).toEqual([]);
      expect(result.nonMatchingItems).toEqual([]);
    });

    it('returns empty matchingItems array for no available matching items', async () => {
      // update FM ID 2 to have none of the food types requested in request ID 4
      await testDataSource.query(`
        UPDATE donation_items di
        SET reserved_quantity = quantity
        FROM donations d
        WHERE di.donation_id = d.donation_id
        AND d.food_manufacturer_id = 2
        AND di.food_type IN ('Non-GMO Cookies', 'Dairy-Free Alternatives', 'Granola Bars')
      `);
      const result = await service.getAvailableItems(4, 2);
      expect(result.matchingItems).toHaveLength(0);
    });

    it('returns empty nonMatchingItems array for no available non-matching items', async () => {
      const result = await service.getAvailableItems(1, 2);
      expect(result.nonMatchingItems).toHaveLength(0);
    });

    it('throws NotFoundException for non-existent request', async () => {
      await expect(service.getAvailableItems(999, 1)).rejects.toThrow(
        new NotFoundException('Request 999 not found'),
      );
    });

    it('throws NotFoundException for non-existent manufacturer', async () => {
      await expect(service.getAvailableItems(1, 999)).rejects.toThrow(
        new NotFoundException('Food Manufacturer 999 not found'),
      );
    });

    it('throws ConflictException for non-approved manufacturer', async () => {
      await expect(service.getAvailableItems(1, 3)).rejects.toThrow(
        new ConflictException('Food Manufacturer 3 not approved'),
      );
    });
  });

  describe('update', () => {
    it('should update request attributes', async () => {
      await testDataSource.query(
        `DELETE FROM allocations WHERE order_id IN (SELECT order_id FROM orders WHERE request_id = 1)`,
      );
      await testDataSource.query(`DELETE FROM orders WHERE request_id = 1`);

      await service.update(1, {
        requestedSize: RequestSize.MEDIUM,
      });

      const fromDb = await service.findOne(1);
      expect(fromDb.requestedSize).toBe(RequestSize.MEDIUM);
      expect(fromDb.requestedFoodTypes).toEqual([
        FoodType.SPREADS_SEED_BUTTERS,
        FoodType.GLUTEN_FREE_BREAD,
        FoodType.DRIED_BEANS,
        FoodType.DAIRY_FREE_ALTERNATIVES,
      ]);
    });

    it('should throw NotFoundException when request is not found', async () => {
      await expect(
        service.update(9999, { requestedSize: RequestSize.MEDIUM }),
      ).rejects.toThrow(new NotFoundException('Request 9999 not found'));
    });

    it('should update all request attributes when all fields are provided', async () => {
      await testDataSource.query(
        `DELETE FROM allocations WHERE order_id IN (SELECT order_id FROM orders WHERE request_id = 1)`,
      );
      await testDataSource.query(`DELETE FROM orders WHERE request_id = 1`);

      await service.update(1, {
        requestedSize: RequestSize.SMALL,
        requestedFoodTypes: [FoodType.GRANOLA],
        location: 'Cambridge, MA',
        additionalInformation: 'Updated information',
        feedbackOnPriorDonation: 'Updated feedback',
      });

      const fromDb = await service.findOne(1);
      expect(fromDb.requestedSize).toBe(RequestSize.SMALL);
      expect(fromDb.requestedFoodTypes).toEqual([FoodType.GRANOLA]);
      expect(fromDb.location).toBe('Cambridge, MA');
      expect(fromDb.additionalInformation).toBe('Updated information');
      expect(fromDb.feedbackOnPriorDonation).toBe('Updated feedback');
    });

    it('should throw BadRequestException when request is not active', async () => {
      await testDataSource.query(
        `UPDATE food_requests SET status = 'closed' WHERE request_id = 1`,
      );

      await expect(
        service.update(1, { requestedSize: RequestSize.MEDIUM }),
      ).rejects.toThrow(
        new BadRequestException(
          `Request must be ${FoodRequestStatus.ACTIVE} in order to be updated`,
        ),
      );
    });

    it('should throw BadRequestException when request has orders', async () => {
      await expect(
        service.update(2, { requestedSize: RequestSize.MEDIUM }),
      ).rejects.toThrow(
        new BadRequestException(
          `Request 2 cannot be updated if it still has orders associated with it`,
        ),
      );
    });

    it('should throw BadRequestException when all DTO fields are undefined', async () => {
      await expect(service.update(1, {})).rejects.toThrow(
        new BadRequestException(
          'At least one field must be provided to update request',
        ),
      );
    });
  });

  describe('delete', () => {
    it('should delete a request by id', async () => {
      await testDataSource.query(
        `DELETE FROM allocations WHERE order_id IN (SELECT order_id FROM orders WHERE request_id = 1)`,
      );
      await testDataSource.query(`DELETE FROM orders WHERE request_id = 1`);

      await service.delete(1);

      const fromDb = await testDataSource
        .getRepository(FoodRequest)
        .findOneBy({ requestId: 1 });
      expect(fromDb).toBeNull();
    });

    it('should throw BadRequestException when request is not active', async () => {
      await testDataSource.query(
        `UPDATE food_requests SET status = 'closed' WHERE request_id = 1`,
      );

      await expect(service.delete(1)).rejects.toThrow(
        new BadRequestException(
          `Request must be ${FoodRequestStatus.ACTIVE} in order to be deleted`,
        ),
      );
    });

    it('should throw BadRequestException when request has orders', async () => {
      await expect(service.delete(2)).rejects.toThrow(
        new BadRequestException(
          `Request 2 cannot be deleted if it still has orders associated with it`,
        ),
      );
    });

    it('should throw NotFoundException when request is not found', async () => {
      await expect(service.delete(9999)).rejects.toThrow(
        new NotFoundException('Request 9999 not found'),
      );
    });
  });

  describe('closeRequest', () => {
    let volunteerId: number;

    beforeEach(() => {
      volunteerId = 6;
    });

    it('should close an active request', async () => {
      const result = await service.closeRequest(3, volunteerId);

      expect(result.status).toBe(FoodRequestStatus.CLOSED);

      const fromDb = await service.findOne(3);
      expect(fromDb.status).toBe(FoodRequestStatus.CLOSED);
    });

    it('should throw BadRequestException when request is already closed', async () => {
      await service.closeRequest(3, volunteerId);

      await expect(service.closeRequest(3, volunteerId)).rejects.toThrow(
        new BadRequestException('Cannot close a request with status: closed'),
      );
    });

    it('should throw NotFoundException for non-existent request', async () => {
      await expect(service.closeRequest(999, volunteerId)).rejects.toThrow(
        new NotFoundException('Request 999 not found'),
      );
    });

    it('should not modify associated order statuses when closed', async () => {
      const ordersBefore = await testDataSource
        .getRepository(Order)
        .find({ where: { requestId: 3 } });

      await service.closeRequest(3, volunteerId);

      const ordersAfter = await testDataSource
        .getRepository(Order)
        .find({ where: { requestId: 3 } });

      ordersAfter.forEach((order, i) => {
        expect(order.status).toBe(ordersBefore[i].status);
      });
    });

    it('sends pantry closed email with acting volunteer info on successful close', async () => {
      const pantry = (await testDataSource.getRepository(Pantry).findOne({
        where: { pantryId: 3 },
        relations: ['pantryUser', 'volunteers'],
      })) as Pantry;

      await service.closeRequest(3, volunteerId);

      const expectedMessage = emailTemplates.pantryRequestClosed({
        pantryName: pantry.pantryName,
        volunteerName: `James Thomas`,
        volunteerEmail: `james.t@volunteer.org`,
      });

      const volunteerEmails = (pantry.volunteers ?? []).map((v) => v.email);

      expect(mockEmailsService.sendEmails).toHaveBeenCalledTimes(1);
      expect(mockEmailsService.sendEmails).toHaveBeenCalledWith({
        toEmail: pantry.pantryUser.email,
        subject: expectedMessage.subject,
        bodyHtml: expectedMessage.bodyHTML,
        bccEmails: expect.arrayContaining(volunteerEmails),
      });
    });

    it('still closes request when email fails (manual close)', async () => {
      mockEmailsService.sendEmails.mockRejectedValueOnce(
        new Error('SMTP error'),
      );

      await expect(service.closeRequest(3, volunteerId)).rejects.toThrow(
        new InternalServerErrorException(
          'Failed to send food request closed email to pantry',
        ),
      );

      const request = await service.findOne(3);

      expect(request.status).toBe(FoodRequestStatus.CLOSED);
      expect(mockEmailsService.sendEmails).toHaveBeenCalledTimes(1);
    });
  });
});
