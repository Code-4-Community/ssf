import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { In } from 'typeorm';
import { DonationItem } from './donationItems.entity';
import { DonationItemsService } from './donationItems.service';
import { Donation } from '../donations/donations.entity';
import { FoodType } from './types';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { testDataSource } from '../config/typeormTestDataSource';
import { CreateDonationItemDto } from './dtos/create-donation-items.dto';
import { ConfirmDonationItemDetailsDto } from './dtos/confirm-donation-item-details.dto';

jest.setTimeout(60000);

// Get seeded data for tests
async function getSeedDonationId(): Promise<number> {
  const result = await testDataSource.query(
    `SELECT donation_id FROM donations
     WHERE food_manufacturer_id = (
       SELECT food_manufacturer_id FROM food_manufacturers
       WHERE food_manufacturer_name = 'FoodCorp Industries' LIMIT 1
     )
     AND status = 'available'
     LIMIT 1`,
  );
  return result[0].donation_id;
}

describe('DonationItemsService', () => {
  let service: DonationItemsService;

  beforeAll(async () => {
    if (!testDataSource.isInitialized) {
      await testDataSource.initialize();
    }

    await testDataSource.query(`DROP SCHEMA IF EXISTS public CASCADE`);
    await testDataSource.query(`CREATE SCHEMA public`);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DonationItemsService,
        {
          provide: getRepositoryToken(DonationItem),
          useValue: testDataSource.getRepository(DonationItem),
        },
        {
          provide: getRepositoryToken(Donation),
          useValue: testDataSource.getRepository(Donation),
        },
      ],
    }).compile();

    service = module.get<DonationItemsService>(DonationItemsService);
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
    it('returns a donation item by id', async () => {
      const result = await testDataSource.query(
        `SELECT item_id FROM donation_items WHERE item_name = 'Peanut Butter (16oz)' LIMIT 1`,
      );
      const itemId = result[0].item_id;

      const item = await service.findOne(itemId);
      expect(item).toBeDefined();
      expect(item.itemId).toEqual(itemId);
      expect(item.itemName).toEqual('Peanut Butter (16oz)');
      expect(Number(item.ozPerItem)).toEqual(16.0);
    });

    it('throws NotFoundException when item does not exist', async () => {
      await expect(service.findOne(99999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getAllDonationItems', () => {
    it('returns all items for a donation', async () => {
      const donationId = await getSeedDonationId();

      const items = await service.getAllDonationItems(donationId);

      // seed data inserts 3 items for the FoodCorp 150-item donation
      expect(items).toHaveLength(3);
    });

    it('returns empty array when donation has no items', async () => {
      const result = await testDataSource.query(
        `INSERT INTO donations (food_manufacturer_id, status, recurrence)
        VALUES (
          (SELECT food_manufacturer_id FROM food_manufacturers
            WHERE food_manufacturer_name = 'FoodCorp Industries' LIMIT 1),
          'available',
          'none'
        ) RETURNING donation_id`,
      );
      const emptyDonationId = result[0].donation_id;

      const items = await service.getAllDonationItems(emptyDonationId);
      expect(items).toHaveLength(0);
    });
  });

  describe('create', () => {
    it('successfully creates a donation item on an existing donation', async () => {
      const donationId = await getSeedDonationId();

      const item = await service.create(
        donationId,
        'Canned Beans',
        10,
        15.5,
        2.99,
        FoodType.DRIED_BEANS,
      );

      const itemDb = await service.findOne(item.itemId);
      expect(itemDb).toBeDefined();
      expect(itemDb.itemId).toBeDefined();
      expect(itemDb.donationId).toEqual(donationId);
      expect(itemDb.itemName).toEqual('Canned Beans');
      expect(itemDb.quantity).toEqual(10);
      expect(itemDb.reservedQuantity).toEqual(0);
      expect(Number(itemDb.ozPerItem)).toEqual(15.5);
      expect(Number(itemDb.estimatedValue)).toEqual(2.99);
      expect(itemDb.foodType).toEqual(FoodType.DRIED_BEANS);
      expect(itemDb.foodRescue).toEqual(false);
    });

    it('throws NotFoundException when donation does not exist', async () => {
      await expect(
        service.create(
          99999,
          'Canned Beans',
          10,
          15.5,
          2.99,
          FoodType.DRIED_BEANS,
        ),
      ).rejects.toThrow(new NotFoundException('Donation not found'));
    });
  });

  describe('createMultiple', () => {
    const validItems: CreateDonationItemDto[] = [
      {
        itemName: 'Canned Beans',
        quantity: 10,
        ozPerItem: 15.5,
        estimatedValue: 2.99,
        foodType: FoodType.DRIED_BEANS,
        foodRescue: false,
      },
      {
        itemName: 'Rice Bag',
        quantity: 5,
        ozPerItem: 32,
        estimatedValue: 4.99,
        foodType: FoodType.GRANOLA,
        foodRescue: true,
      },
    ];

    async function getSeedDonation(): Promise<Donation> {
      const donationId = await getSeedDonationId();
      return testDataSource
        .getRepository(Donation)
        .findOneByOrFail({ donationId });
    }

    it('creates all items with correct fields persisted to the database', async () => {
      const donation = await getSeedDonation();
      const transactionManager = testDataSource.createEntityManager();

      const result = await service.createMultiple(
        donation,
        validItems,
        transactionManager,
      );

      expect(result).toHaveLength(2);

      const itemRepo = testDataSource.getRepository(DonationItem);
      const [beans, rice] = await itemRepo.findBy({
        itemId: In(result.map((i) => i.itemId)),
      });

      expect(beans.itemId).toBeDefined();
      expect(beans.donationId).toEqual(donation.donationId);
      expect(beans.itemName).toEqual('Canned Beans');
      expect(beans.quantity).toEqual(10);
      expect(beans.reservedQuantity).toEqual(0);
      expect(Number(beans.ozPerItem)).toEqual(15.5);
      expect(Number(beans.estimatedValue)).toEqual(2.99);
      expect(beans.foodType).toEqual(FoodType.DRIED_BEANS);
      expect(beans.foodRescue).toEqual(false);

      expect(rice.itemId).toBeDefined();
      expect(rice.donationId).toEqual(donation.donationId);
      expect(rice.itemName).toEqual('Rice Bag');
      expect(rice.quantity).toEqual(5);
      expect(rice.reservedQuantity).toEqual(0);
      expect(Number(rice.ozPerItem)).toEqual(32);
      expect(Number(rice.estimatedValue)).toEqual(4.99);
      expect(rice.foodType).toEqual(FoodType.GRANOLA);
      expect(rice.foodRescue).toEqual(true);
    });

    it('creates items with optional fields omitted', async () => {
      const donation = await getSeedDonation();
      const transactionManager = testDataSource.createEntityManager();

      const minimalItems: CreateDonationItemDto[] = [
        {
          itemName: 'Plain Item',
          quantity: 3,
          foodType: FoodType.DRIED_BEANS,
          foodRescue: true,
        },
      ];

      const result = await service.createMultiple(
        donation,
        minimalItems,
        transactionManager,
      );

      expect(result).toHaveLength(1);
      expect(result[0].itemId).toBeDefined();
      expect(result[0].ozPerItem).toBeNull();
      expect(result[0].estimatedValue).toBeNull();
    });

    it('rolls back all items when one fails within a transaction', async () => {
      const donation = await getSeedDonation();

      const itemsBefore = await testDataSource.query(
        `SELECT * FROM donation_items WHERE donation_id = $1`,
        [donation.donationId],
      );

      const badItems: CreateDonationItemDto[] = [
        ...validItems,
        {
          itemName: 'a'.repeat(1000),
          quantity: 5,
          foodType: FoodType.DRIED_BEANS,
          foodRescue: false,
        },
      ];

      await expect(
        testDataSource.transaction(async (transactionManager) => {
          await service.createMultiple(donation, badItems, transactionManager);
        }),
      ).rejects.toThrow();

      const itemsAfter = await testDataSource.query(
        `SELECT * FROM donation_items WHERE donation_id = $1`,
        [donation.donationId],
      );

      expect(itemsAfter).toHaveLength(itemsBefore.length);
    });

    it('returns empty array when given empty items list', async () => {
      const donation = await getSeedDonation();
      const transactionManager = testDataSource.createEntityManager();

      const result = await service.createMultiple(
        donation,
        [],
        transactionManager,
      );

      expect(result).toHaveLength(0);
    });
  });

  describe('confirmItemDetails', () => {
    const makeDto = (itemId: number): ConfirmDonationItemDetailsDto => ({
      itemId,
      ozPerItem: 5.0,
      estimatedValue: 10.0,
      foodRescue: true,
    });

    async function insertMatchedDonation(): Promise<number> {
      const result = await testDataSource.query(
        `INSERT INTO donations
          (food_manufacturer_id, status, recurrence, recurrence_freq,
           next_donation_dates, occurrences_remaining)
         VALUES (
           (SELECT food_manufacturer_id FROM food_manufacturers
            WHERE food_manufacturer_name = 'FoodCorp Industries' LIMIT 1),
           'matched', 'none', NULL, NULL, NULL
         )
         RETURNING donation_id`,
      );
      return result[0].donation_id;
    }

    async function insertDonationItem(
      donationId: number,
      qty: number,
      reserved: number,
    ): Promise<number> {
      const result = await testDataSource.query(
        `INSERT INTO donation_items
          (donation_id, item_name, quantity, reserved_quantity, food_type, details_confirmed)
         VALUES ($1, 'Test Item', $2, $3, 'Granola', false)
         RETURNING item_id`,
        [donationId, qty, reserved],
      );
      return result[0].item_id;
    }

    it('throws NotFoundException when a donation item does not exist', async () => {
      const donationId = await insertMatchedDonation();
      await expect(
        testDataSource.transaction((tm) =>
          service.confirmItemDetails(donationId, [makeDto(99999)], tm),
        ),
      ).rejects.toThrow(new NotFoundException('Donation item 99999 not found'));
    });

    it('throws BadRequestException when an item does not belong to the donation', async () => {
      const donationId = await insertMatchedDonation();
      // Item 1 belongs to donation 1, not the new donation
      await expect(
        testDataSource.transaction((tm) =>
          service.confirmItemDetails(donationId, [makeDto(1)], tm),
        ),
      ).rejects.toThrow(
        new BadRequestException(
          `Donation item 1 does not belong to Donation ${donationId}`,
        ),
      );
    });

    it('throws BadRequestException when an item in the body is already confirmed', async () => {
      const donationId = await insertMatchedDonation();
      const itemId = await insertDonationItem(donationId, 10, 10);
      await testDataSource.query(
        `UPDATE donation_items SET details_confirmed = true WHERE item_id = $1`,
        [itemId],
      );

      await expect(
        testDataSource.transaction((tm) =>
          service.confirmItemDetails(donationId, [makeDto(itemId)], tm),
        ),
      ).rejects.toThrow(
        new BadRequestException(
          `Donation item ${itemId} has already been confirmed`,
        ),
      );
    });

    it('updates fields and sets detailsConfirmed to true for a single item', async () => {
      const donationId = await insertMatchedDonation();
      const itemId = await insertDonationItem(donationId, 10, 5);

      const dto: ConfirmDonationItemDetailsDto = {
        itemId,
        ozPerItem: 8.5,
        estimatedValue: 12.0,
        foodRescue: false,
      };

      await testDataSource.transaction((tm) =>
        service.confirmItemDetails(donationId, [dto], tm),
      );

      const item = await testDataSource
        .getRepository(DonationItem)
        .findOneBy({ itemId });
      expect(Number(item?.ozPerItem)).toBe(8.5);
      expect(Number(item?.estimatedValue)).toBe(12.0);
      expect(item?.foodRescue).toBe(false);
      expect(item?.detailsConfirmed).toBe(true);
    });

    it('updates multiple items in a single call', async () => {
      const donationId = await insertMatchedDonation();
      const itemId1 = await insertDonationItem(donationId, 10, 5);
      const itemId2 = await insertDonationItem(donationId, 20, 10);

      await testDataSource.transaction((tm) =>
        service.confirmItemDetails(
          donationId,
          [
            {
              itemId: itemId1,
              ozPerItem: 4.0,
              estimatedValue: 8.0,
              foodRescue: true,
            },
            {
              itemId: itemId2,
              ozPerItem: 6.0,
              estimatedValue: 14.0,
              foodRescue: false,
            },
          ],
          tm,
        ),
      );

      const item1 = await testDataSource
        .getRepository(DonationItem)
        .findOneBy({ itemId: itemId1 });
      const item2 = await testDataSource
        .getRepository(DonationItem)
        .findOneBy({ itemId: itemId2 });

      expect(Number(item1?.ozPerItem)).toBe(4.0);
      expect(item1?.foodRescue).toBe(true);
      expect(Number(item1?.estimatedValue)).toBe(8.0);
      expect(item1?.detailsConfirmed).toBe(true);

      expect(Number(item2?.ozPerItem)).toBe(6.0);
      expect(item2?.foodRescue).toBe(false);
      expect(Number(item2?.estimatedValue)).toBe(14.0);
      expect(item2?.detailsConfirmed).toBe(true);
    });

    it('rolls back all updates when one item does not belong to the donation', async () => {
      const donationId = await insertMatchedDonation();
      const itemId = await insertDonationItem(donationId, 10, 5);

      // Second dto references item 1 which belongs to donation 1, not ours
      await expect(
        testDataSource.transaction((tm) =>
          service.confirmItemDetails(
            donationId,
            [makeDto(itemId), makeDto(1)],
            tm,
          ),
        ),
      ).rejects.toThrow(
        new BadRequestException(
          `Donation item 1 does not belong to Donation ${donationId}`,
        ),
      );

      const item = await testDataSource
        .getRepository(DonationItem)
        .findOneBy({ itemId });
      expect(item?.detailsConfirmed).toBe(false);
      expect(item?.ozPerItem).toBeNull();
    });
  });
});
