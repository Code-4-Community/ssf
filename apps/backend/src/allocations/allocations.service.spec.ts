import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';
import { testDataSource } from '../config/typeormTestDataSource';
import { AllocationsService } from './allocations.service';
import { Allocation } from './allocations.entity';
import { DonationItem } from '../donationItems/donationItems.entity';

jest.setTimeout(60000);

describe('AllocationsService', () => {
  let service: AllocationsService;

  beforeAll(async () => {
    if (!testDataSource.isInitialized) {
      await testDataSource.initialize();
    }
    await testDataSource.query(`DROP SCHEMA IF EXISTS public CASCADE`);
    await testDataSource.query(`CREATE SCHEMA public`);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AllocationsService,
        {
          provide: getRepositoryToken(Allocation),
          useValue: testDataSource.getRepository(Allocation),
        },
        {
          provide: getRepositoryToken(DonationItem),
          useValue: testDataSource.getRepository(DonationItem),
        },
      ],
    }).compile();

    service = module.get<AllocationsService>(AllocationsService);
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

  describe('getAllAllocationsByOrder', () => {
    it('should return empty array for order with no allocations', async () => {
      await testDataSource.query(`DELETE FROM allocations WHERE order_id = 1`);

      const result = await service.getAllAllocationsByOrder(1);

      expect(result).toEqual([]);
    });

    it('should return all allocations for a given order', async () => {
      const result = await service.getAllAllocationsByOrder(2);

      expect(result).toHaveLength(3);
      const quantities = result
        .map((a) => a.allocatedQuantity)
        .sort((a, b) => a! - b!);
      expect(quantities).toEqual([15, 20, 30]);
      result.forEach((a) => {
        expect(a.allocationId).toBeDefined();
        expect(a.item).toBeDefined();
      });
    });
  });

  describe('createMultiple', () => {
    it('should create a single allocation and increment reservedQuantity', async () => {
      const orderId = 1;
      const itemId = 4;

      const [{ reserved_quantity: reserved_quantity_before }] =
        await testDataSource.query(
          `SELECT reserved_quantity FROM donation_items WHERE item_id = $1`,
          [itemId],
        );

      expect(Number(reserved_quantity_before)).toBe(30);

      const result = await service.createMultiple(
        orderId,
        new Map([[itemId, 3]]),
      );

      expect(result).toHaveLength(1);
      expect(result[0].allocatedQuantity).toBe(3);
      expect(result[0].orderId).toBe(orderId);
      expect(result[0].itemId).toBe(itemId);
      const [{ reserved_quantity }] = await testDataSource.query(
        `SELECT reserved_quantity FROM donation_items WHERE item_id = $1`,
        [itemId],
      );
      expect(Number(reserved_quantity)).toBe(33);
    });

    it('should create multiple allocations and increment each reservedQuantity', async () => {
      const orderId = 1;
      const itemId1 = 4;
      const itemId2 = 5;

      const [{ reserved_quantity: reserved_quantity1_before }] =
        await testDataSource.query(
          `SELECT reserved_quantity FROM donation_items WHERE item_id = $1`,
          [itemId1],
        );

      expect(Number(reserved_quantity1_before)).toBe(30);

      const [{ reserved_quantity: reserved_quantity2_before }] =
        await testDataSource.query(
          `SELECT reserved_quantity FROM donation_items WHERE item_id = $1`,
          [itemId2],
        );

      expect(Number(reserved_quantity2_before)).toBe(20);

      const result = await service.createMultiple(
        orderId,
        new Map([
          [itemId1, 5],
          [itemId2, 2],
        ]),
      );

      expect(result).toHaveLength(2);
      const [item1] = await testDataSource.query(
        `SELECT reserved_quantity FROM donation_items WHERE item_id = $1`,
        [itemId1],
      );
      const [item2] = await testDataSource.query(
        `SELECT reserved_quantity FROM donation_items WHERE item_id = $1`,
        [itemId2],
      );
      expect(Number(item1.reserved_quantity)).toBe(35);
      expect(Number(item2.reserved_quantity)).toBe(22);
    });

    it('should work with a given transaction manager', async () => {
      const orderId = 1;
      const itemId = 4;

      let result: Allocation[] = [];
      await testDataSource.transaction(async (manager) => {
        result = await service.createMultiple(
          orderId,
          new Map([[itemId, 4]]),
          manager,
        );
      });

      expect(result).toHaveLength(1);
      expect(result[0].allocatedQuantity).toBe(4);
      const [{ reserved_quantity }] = await testDataSource.query(
        `SELECT reserved_quantity FROM donation_items WHERE item_id = $1`,
        [itemId],
      );
      expect(Number(reserved_quantity)).toBe(34);
    });

    it('should rollback all changes if an error occurs during the transaction', async () => {
      const orderId = 1;
      const itemId1 = 4;
      const itemId2 = 5;

      const [{ reserved_quantity: before1 }] = await testDataSource.query(
        `SELECT reserved_quantity FROM donation_items WHERE item_id = $1`,
        [itemId1],
      );

      const [{ reserved_quantity: before2 }] = await testDataSource.query(
        `SELECT reserved_quantity FROM donation_items WHERE item_id = $1`,
        [itemId2],
      );

      const [{ count: allocationCountBefore }] = await testDataSource.query(
        `SELECT COUNT(*) FROM allocations`,
      );

      await expect(
        testDataSource.transaction(async (manager) => {
          await service.createMultiple(
            orderId,
            new Map([[itemId1, 5]]),
            manager,
          );

          throw new Error('Simulated failure');
        }),
      ).rejects.toThrow('Simulated failure');

      const [{ reserved_quantity: after1 }] = await testDataSource.query(
        `SELECT reserved_quantity FROM donation_items WHERE item_id = $1`,
        [itemId1],
      );

      const [{ reserved_quantity: after2 }] = await testDataSource.query(
        `SELECT reserved_quantity FROM donation_items WHERE item_id = $1`,
        [itemId2],
      );

      const [{ count: allocationCountAfter }] = await testDataSource.query(
        `SELECT COUNT(*) FROM allocations`,
      );

      expect(Number(after1)).toBe(Number(before1));
      expect(Number(after2)).toBe(Number(before2));
      expect(Number(allocationCountAfter)).toBe(Number(allocationCountBefore));
    });
  });
});
