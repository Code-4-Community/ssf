import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FoodRequest } from './request.entity';
import { RequestsService } from './request.service';
import { Pantry } from '../pantries/pantries.entity';
import { RequestSize } from './types';
import { Order } from '../orders/order.entity';
import { OrderStatus } from '../orders/types';
import { FoodManufacturer } from '../foodManufacturers/manufacturers.entity';
import { FoodType } from '../donationItems/types';
import { DonationItem } from '../donationItems/donationItems.entity';
import { testDataSource } from '../config/typeormTestDataSource';
import { NotFoundException } from '@nestjs/common';

jest.setTimeout(60000);

describe('RequestsService', () => {
  let service: RequestsService;

  beforeAll(async () => {
    if (!testDataSource.isInitialized) {
      await testDataSource.initialize();
    }

    const module = await Test.createTestingModule({
      providers: [
        RequestsService,
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
      ],
    }).compile();

    service = module.get<RequestsService>(RequestsService);
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
      const result = await service.getOrderDetails(1);
      expect(result).toBeDefined();
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        orderId: 1,
        status: OrderStatus.DELIVERED,
        foodManufacturerName: 'FoodCorp Industries',
        items: expect.any(Array),
      });
      expect(result[0].items).toHaveLength(3);
    });

    it('should throw NotFoundException for non-existent request', async () => {
      await expect(service.getOrderDetails(999)).rejects.toThrow(
        new NotFoundException('Request 999 not found'),
      );
    });

    it('should return empty list if no associated orders', async () => {
      const result = await testDataSource.query(`
        INSERT INTO food_requests (pantry_id, requested_size, requested_food_types, requested_at)
        VALUES (
          (SELECT pantry_id FROM pantries LIMIT 1),
          'Small (2-5 boxes)',
          ARRAY[]::food_type_enum[],
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
        [FoodType.DRIED_BEANS, FoodType.REFRIGERATED_MEALS],
        'Additional info',
        null,
        null,
        null,
      );
      expect(result).toBeDefined();
      expect(result.pantryId).toBe(pantryId);
      expect(result.requestedSize).toBe(RequestSize.MEDIUM);
      expect(result.requestedFoodTypes).toEqual([
        FoodType.DRIED_BEANS,
        FoodType.REFRIGERATED_MEALS,
      ]);
      expect(result.additionalInformation).toBe('Additional info');
      expect(result.dateReceived).toBeNull();
      expect(result.feedback).toBeNull();
      expect(result.photos).toBeNull();
    });

    it('should throw NotFoundException for non-existent pantry', async () => {
      await expect(
        service.create(
          999,
          RequestSize.MEDIUM,
          [FoodType.DRIED_BEANS, FoodType.REFRIGERATED_MEALS],
          'Additional info',
          null,
          null,
          null,
        ),
      ).rejects.toThrow(new NotFoundException('Pantry 999 not found'));
    });
  });

  describe('find', () => {
    it('should return all food requests for a specific pantry', async () => {
      const pantryId = 1;
      const result = await service.find(pantryId);

      expect(result).toBeDefined();
      expect(result).toHaveLength(2);
      expect(result.every((r) => r.pantryId === pantryId)).toBe(true);
    });

    it('should return empty array for pantry with no requests', async () => {
      const pantryId = 5;
      const result = await service.find(pantryId);

      expect(result).toBeDefined();
      expect(result).toEqual([]);
    });
  });

  describe('updateDeliveryDetails', () => {
    it('should update and return the food request with new delivery details', async () => {
      const requestId = 1;
      const deliveryDate = new Date();
      const feedback = 'Good delivery!';
      const photos = ['photo1.jpg', 'photo2.jpg'];

      const result = await service.updateDeliveryDetails(
        requestId,
        deliveryDate,
        feedback,
        photos,
      );

      expect(result).toBeDefined();
      expect(result.requestId).toBe(requestId);
      expect(result.dateReceived).toEqual(deliveryDate);
      expect(result.feedback).toBe(feedback);
      expect(result.photos).toEqual(photos);
    });

    it('should throw NotFoundException for non-existent request', async () => {
      const requestId = 999;
      const deliveryDate = new Date();
      const feedback = 'Good delivery!';
      const photos = ['photo1.jpg', 'photo2.jpg'];

      await expect(
        service.updateDeliveryDetails(
          requestId,
          deliveryDate,
          feedback,
          photos,
        ),
      ).rejects.toThrow(new NotFoundException('Request 999 not found'));
    });

    it('should throw NotFoundException if there are no associated orders', async () => {
      const deliveryDate = new Date();
      const feedback = 'Good delivery!';
      const photos = ['photo1.jpg', 'photo2.jpg'];

      const result = await testDataSource.query(`
        INSERT INTO food_requests (pantry_id, requested_size, requested_food_types, requested_at)
        VALUES (
          (SELECT pantry_id FROM pantries LIMIT 1),
          'Small (2-5 boxes)',
          ARRAY[]::food_type_enum[],
          NOW()
        )
        RETURNING request_id
      `);
      const requestId = result[0].request_id;

      await expect(
        service.updateDeliveryDetails(
          requestId,
          deliveryDate,
          feedback,
          photos,
        ),
      ).rejects.toThrow(
        new NotFoundException('No associated orders found for this request'),
      );
    });
  });

  describe('getMatchingManufacturers', () => {
    it('throws NotFoundException when request does not exist', async () => {
      await expect(service.getMatchingManufacturers(999)).rejects.toThrow(
        new NotFoundException('Request 999 not found'),
      );
    });

    it('every manufacturer in matchingManufacturers has at least one item matching a requested food type', async () => {
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
    });

    it('every manufacturer in nonMatchingManufacturers has no items matching a requested food type', async () => {
      const requestId = 1;
      const request = await service.findOne(requestId);
      const result = await service.getMatchingManufacturers(requestId);

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

    it('returns empty matching list when no food types are requested', async () => {
      const result = await testDataSource.query(`
        INSERT INTO food_requests (pantry_id, requested_size, requested_food_types, requested_at)
        VALUES (
          (SELECT pantry_id FROM pantries LIMIT 1),
          'Small (2-5 boxes)',
          ARRAY[]::food_type_enum[],
          NOW()
        )
        RETURNING request_id
      `);
      const requestId = result[0].request_id;

      const { matchingManufacturers } = await service.getMatchingManufacturers(
        requestId,
      );
      expect(matchingManufacturers).toHaveLength(0);
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
  });
});
