import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { In } from 'typeorm';
import { DonationItem } from './donationItems.entity';
import { DonationItemsService } from './donationItems.service';
import { Donation } from '../donations/donations.entity';
import { FoodType } from './types';
import { NotFoundException } from '@nestjs/common';
import { testDataSource } from '../config/typeormTestDataSource';
import { CreateDonationItemDto } from './dtos/create-donation-items.dto';

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
});
