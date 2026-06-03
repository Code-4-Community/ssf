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
import { UpdateDonationItemDetailsDto } from './dtos/update-donation-item-details.dto';
import { ReplaceDonationItemDto } from './dtos/replace-donation-item.dto';

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
      expect(beans.detailsConfirmed).toEqual(true);

      expect(rice.itemId).toBeDefined();
      expect(rice.donationId).toEqual(donation.donationId);
      expect(rice.itemName).toEqual('Rice Bag');
      expect(rice.quantity).toEqual(5);
      expect(rice.reservedQuantity).toEqual(0);
      expect(Number(rice.ozPerItem)).toEqual(32);
      expect(Number(rice.estimatedValue)).toEqual(4.99);
      expect(rice.foodType).toEqual(FoodType.GRANOLA);
      expect(rice.foodRescue).toEqual(true);
      expect(rice.detailsConfirmed).toEqual(true);
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
      expect(result[0].detailsConfirmed).toEqual(false);
    });

    it('sets detailsConfirmed to true only when both ozPerItem and estimatedValue are provided', async () => {
      const donation = await getSeedDonation();
      const transactionManager = testDataSource.createEntityManager();

      const mixedItems: CreateDonationItemDto[] = [
        {
          itemName: 'Both Fields',
          quantity: 4,
          ozPerItem: 12,
          estimatedValue: 3.5,
          foodType: FoodType.DRIED_BEANS,
          foodRescue: false,
        },
        {
          itemName: 'Missing Estimated Value',
          quantity: 2,
          ozPerItem: 8,
          foodType: FoodType.DRIED_BEANS,
          foodRescue: false,
        },
        {
          itemName: 'Missing Oz Per Item',
          quantity: 6,
          estimatedValue: 1.99,
          foodType: FoodType.DRIED_BEANS,
          foodRescue: false,
        },
      ];

      const result = await service.createMultiple(
        donation,
        mixedItems,
        transactionManager,
      );

      const byName = Object.fromEntries(result.map((i) => [i.itemName, i]));
      expect(byName['Both Fields'].detailsConfirmed).toEqual(true);
      expect(byName['Missing Estimated Value'].detailsConfirmed).toEqual(false);
      expect(byName['Missing Oz Per Item'].detailsConfirmed).toEqual(false);
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

  describe('updateItemDetails', () => {
    const makeDto = (itemId: number): UpdateDonationItemDetailsDto => ({
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
          service.updateItemDetails(donationId, [makeDto(99999)], tm),
        ),
      ).rejects.toThrow(new NotFoundException('Donation item 99999 not found'));
    });

    it('throws BadRequestException when an item does not belong to the donation', async () => {
      const donationId = await insertMatchedDonation();
      // Item 1 belongs to donation 1, not the new donation
      await expect(
        testDataSource.transaction((tm) =>
          service.updateItemDetails(donationId, [makeDto(1)], tm),
        ),
      ).rejects.toThrow(
        new BadRequestException(
          `Donation item 1 does not belong to Donation ${donationId}`,
        ),
      );
    });

    it('updates fields and sets detailsConfirmed to true for a single item', async () => {
      const donationId = await insertMatchedDonation();
      const itemId = await insertDonationItem(donationId, 10, 5);

      const dto: UpdateDonationItemDetailsDto = {
        itemId,
        ozPerItem: 8.5,
        estimatedValue: 12.0,
        foodRescue: false,
      };

      await testDataSource.transaction((tm) =>
        service.updateItemDetails(donationId, [dto], tm),
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
        service.updateItemDetails(
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
          service.updateItemDetails(
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

    it('returns false and does not confirm when only some fields are provided', async () => {
      const donationId = await insertMatchedDonation();
      const itemId = await insertDonationItem(donationId, 10, 5);

      const result = await testDataSource.transaction((tm) =>
        service.updateItemDetails(donationId, [{ itemId, ozPerItem: 8.5 }], tm),
      );

      expect(result).toBe(false);
      const item = await testDataSource
        .getRepository(DonationItem)
        .findOneBy({ itemId });
      expect(Number(item?.ozPerItem)).toBe(8.5);
      expect(item?.estimatedValue).toBeNull();
      expect(item?.detailsConfirmed).toBe(false);
    });

    it('confirms item on a second call that supplies the remaining fields', async () => {
      const donationId = await insertMatchedDonation();
      const itemId = await insertDonationItem(donationId, 10, 5);

      const firstResult = await testDataSource.transaction((tm) =>
        service.updateItemDetails(donationId, [{ itemId, ozPerItem: 8.5 }], tm),
      );
      expect(firstResult).toBe(false);

      const secondResult = await testDataSource.transaction((tm) =>
        service.updateItemDetails(
          donationId,
          [{ itemId, estimatedValue: 12.0, foodRescue: true }],
          tm,
        ),
      );
      expect(secondResult).toBe(true);

      const item = await testDataSource
        .getRepository(DonationItem)
        .findOneBy({ itemId });
      expect(Number(item?.ozPerItem)).toBe(8.5);
      expect(Number(item?.estimatedValue)).toBe(12.0);
      expect(item?.foodRescue).toBe(true);
      expect(item?.detailsConfirmed).toBe(true);
    });

    it('allows updating an already-confirmed item without throwing', async () => {
      const donationId = await insertMatchedDonation();
      const itemId = await insertDonationItem(donationId, 10, 5);
      await testDataSource.query(
        `UPDATE donation_items
         SET details_confirmed = true, oz_per_item = 5.0, estimated_value = 10.0
         WHERE item_id = $1`,
        [itemId],
      );

      const result = await testDataSource.transaction((tm) =>
        service.updateItemDetails(donationId, [{ itemId, ozPerItem: 9.0 }], tm),
      );

      expect(result).toBe(true);
      const item = await testDataSource
        .getRepository(DonationItem)
        .findOneBy({ itemId });
      expect(Number(item?.ozPerItem)).toBe(9.0);
      expect(item?.detailsConfirmed).toBe(true);
    });
  });

  describe('editItems', () => {
    const makeItem = (
      overrides: Partial<ReplaceDonationItemDto> = {},
    ): ReplaceDonationItemDto => ({
      itemName: 'Edited Item',
      quantity: 20,
      ozPerItem: 8,
      estimatedValue: 3.5,
      foodType: FoodType.QUINOA,
      foodRescue: true,
      ...overrides,
    });

    const donationId = 3;
    const itemA = 7;
    const itemB = 8;

    beforeEach(async () => {
      await testDataSource.query(
        `DELETE FROM allocations WHERE item_id IN ($1, $2)`,
        [itemA, itemB],
      );
    });

    it('updates existing items, inserts new items, and deletes omitted items', async () => {
      await testDataSource.transaction((tm) =>
        service.editItems(
          donationId,
          [
            makeItem({
              itemId: itemA,
              itemName: 'Item A Updated',
              quantity: 99,
            }),
            makeItem({ itemName: 'Brand New Item' }),
          ],
          tm,
        ),
      );

      const items = await service.getAllDonationItems(donationId);
      expect(items).toHaveLength(2);

      const names = items.map((i) => i.itemName).sort();
      expect(names).toEqual(['Brand New Item', 'Item A Updated']);

      const updated = items.find((i) => i.itemId === itemA) as DonationItem;
      expect(updated.quantity).toBe(99);
      expect(updated.foodRescue).toBe(true);
      expect(updated.foodType).toBe(FoodType.QUINOA);
      expect(Number(updated.ozPerItem)).toBe(8);
      expect(Number(updated.estimatedValue)).toBe(3.5);
      expect(updated.detailsConfirmed).toBe(true);

      const inserted = items.find(
        (i) => i.itemName === 'Brand New Item',
      ) as DonationItem;
      expect(inserted.donationId).toBe(donationId);
      expect(inserted.reservedQuantity).toBe(0);
      expect(inserted.detailsConfirmed).toBe(true);

      await expect(service.findOne(itemB)).rejects.toThrow();
    });

    it('deletes all existing items absent from the body', async () => {
      await testDataSource.transaction((tm) =>
        service.editItems(donationId, [makeItem({ itemName: 'Only New' })], tm),
      );

      const items = await service.getAllDonationItems(donationId);
      expect(items).toHaveLength(1);
      expect(items[0].itemName).toBe('Only New');

      await expect(service.findOne(itemA)).rejects.toThrow();
      await expect(service.findOne(itemB)).rejects.toThrow();
    });

    it('throws BadRequestException when an itemId does not belong to the donation', async () => {
      const foreignItemId = 11;

      await expect(
        testDataSource.transaction((tm) =>
          service.editItems(
            donationId,
            [makeItem({ itemId: foreignItemId })],
            tm,
          ),
        ),
      ).rejects.toThrow(
        new BadRequestException(
          `Donation item ${foreignItemId} does not belong to Donation ${donationId}`,
        ),
      );
    });

    it('throws BadRequestException when the same itemId appears twice', async () => {
      await expect(
        testDataSource.transaction((tm) =>
          service.editItems(
            donationId,
            [makeItem({ itemId: itemA }), makeItem({ itemId: itemA })],
            tm,
          ),
        ),
      ).rejects.toThrow(
        new BadRequestException(`Duplicate itemId ${itemA} in request`),
      );
    });

    it('rolls back all changes when one item fails to persist within the transaction', async () => {
      await expect(
        testDataSource.transaction((tm) =>
          service.editItems(
            donationId,
            [
              makeItem({ itemId: itemA, itemName: 'Item A Updated' }),
              makeItem({ itemName: 'a'.repeat(1000) }), // exceeds varchar(255)
            ],
            tm,
          ),
        ),
      ).rejects.toThrow();

      const items = await service.getAllDonationItems(donationId);
      expect(items).toHaveLength(2);

      const a = items.find((i) => i.itemId === itemA);
      expect(a?.itemName).toBe('Rice (5lb bag)');
      const b = items.find((i) => i.itemId === itemB);
      expect(b).toBeDefined();
    });
  });
});
