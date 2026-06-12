import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { mock } from 'jest-mock-extended';
import { testDataSource } from '../config/typeormTestDataSource';
import { AllocationsService } from './allocations.service';
import { Allocation } from './allocations.entity';
import { DonationItem } from '../donationItems/donationItems.entity';
import { Donation } from '../donations/donations.entity';
import { DonationItemsService } from '../donationItems/donationItems.service';
import { DonationService } from '../donations/donations.service';
import { BadRequestException } from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { Order } from '../orders/order.entity';
import { UpdateAllocationsDto } from '../orders/dtos/update-allocations.dto';

jest.setTimeout(60000);

const FOODCORP = 'FoodCorp Industries';
const OTHER_FM = 'Healthy Foods Co';

const mockDonationService = mock<DonationService>();

async function getFmId(name: string): Promise<number> {
  const [{ food_manufacturer_id }] = await testDataSource.query(
    `SELECT food_manufacturer_id FROM food_manufacturers WHERE food_manufacturer_name = $1 LIMIT 1`,
    [name],
  );
  return food_manufacturer_id;
}

async function insertDonationForFm(fmId: number): Promise<number> {
  const [{ donation_id }] = await testDataSource.query(
    `INSERT INTO donations (food_manufacturer_id, status, recurrence)
     VALUES ($1, 'matched', 'none') RETURNING donation_id`,
    [fmId],
  );
  return donation_id;
}

async function insertItem(
  donationId: number,
  quantity: number,
  reserved: number,
): Promise<number> {
  const [{ item_id }] = await testDataSource.query(
    `INSERT INTO donation_items (donation_id, item_name, quantity, reserved_quantity, food_type, details_confirmed)
     VALUES ($1, 'Test Item', $2, $3, 'Granola', false) RETURNING item_id`,
    [donationId, quantity, reserved],
  );
  return item_id;
}

async function insertOrder(fmId: number): Promise<Order> {
  const [{ order_id }] = await testDataSource.query(
    `INSERT INTO orders (request_id, food_manufacturer_id, status, assignee_id)
     VALUES ((SELECT request_id FROM food_requests LIMIT 1), $1, 'pending', (SELECT user_id FROM users LIMIT 1))
     RETURNING order_id`,
    [fmId],
  );
  return testDataSource.getRepository(Order).findOneByOrFail({
    orderId: order_id,
  });
}

async function insertAllocation(
  orderId: number,
  itemId: number,
  quantity: number,
): Promise<number> {
  const [{ allocation_id }] = await testDataSource.query(
    `INSERT INTO allocations (order_id, item_id, allocated_quantity)
     VALUES ($1, $2, $3) RETURNING allocation_id`,
    [orderId, itemId, quantity],
  );
  return allocation_id;
}

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
        {
          provide: getRepositoryToken(Donation),
          useValue: testDataSource.getRepository(Donation),
        },
        DonationItemsService,
        {
          provide: DonationService,
          useValue: mockDonationService,
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
    jest.restoreAllMocks();
    mockDonationService.recheckDonationAllocationStatus.mockReset();
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

  describe('deleteMultiple', () => {
    it('never calls remove when given an empty array', async () => {
      const allocationRepo = testDataSource.getRepository(Allocation);
      const removeSpy = jest.spyOn(allocationRepo, 'remove');

      await service.deleteMultiple([]);

      expect(removeSpy).not.toHaveBeenCalled();

      removeSpy.mockRestore();
    });

    it('removes the allocations and decrements each donation item reservedQuantity', async () => {
      const allocationRepo = testDataSource.getRepository(Allocation);
      const donationItemRepo = testDataSource.getRepository(DonationItem);

      // Two donation items with known reserved quantities (donation 1 is seeded).
      const [{ item_id: itemAId }] = await testDataSource.query(
        `INSERT INTO donation_items (donation_id, item_name, quantity, reserved_quantity, food_type, details_confirmed)
         VALUES (1, 'Item A', 20, 5, 'Granola', false) RETURNING item_id`,
      );
      const [{ item_id: itemBId }] = await testDataSource.query(
        `INSERT INTO donation_items (donation_id, item_name, quantity, reserved_quantity, food_type, details_confirmed)
         VALUES (1, 'Item B', 20, 8, 'Granola', false) RETURNING item_id`,
      );

      // Two allocations against those items (order 1 is seeded).
      const [{ allocation_id: allocAId }] = await testDataSource.query(
        `INSERT INTO allocations (order_id, item_id, allocated_quantity)
         VALUES (1, $1, 3) RETURNING allocation_id`,
        [itemAId],
      );
      const [{ allocation_id: allocBId }] = await testDataSource.query(
        `INSERT INTO allocations (order_id, item_id, allocated_quantity)
         VALUES (1, $1, 8) RETURNING allocation_id`,
        [itemBId],
      );

      const itemABefore = (await donationItemRepo.findOneBy({
        itemId: itemAId,
      })) as DonationItem;
      const itemBBefore = (await donationItemRepo.findOneBy({
        itemId: itemBId,
      })) as DonationItem;
      expect(itemABefore.reservedQuantity).toBe(5);
      expect(itemBBefore.reservedQuantity).toBe(8);

      const allocA = (await allocationRepo.findOneBy({
        allocationId: allocAId,
      })) as Allocation;
      const allocB = (await allocationRepo.findOneBy({
        allocationId: allocBId,
      })) as Allocation;

      await service.deleteMultiple([allocA, allocB]);

      expect(
        await allocationRepo.findOneBy({ allocationId: allocAId }),
      ).toBeNull();
      expect(
        await allocationRepo.findOneBy({ allocationId: allocBId }),
      ).toBeNull();

      const itemAAfter = (await donationItemRepo.findOneBy({
        itemId: itemAId,
      })) as DonationItem;
      const itemBAfter = (await donationItemRepo.findOneBy({
        itemId: itemBId,
      })) as DonationItem;
      expect(itemAAfter.reservedQuantity).toBe(2); // 5 - 3
      expect(itemBAfter.reservedQuantity).toBe(0); // 8 - 8
    });
  });

  describe('freeAllByOrder', () => {
    const orderId = 2;

    it("calls deleteMultiple with the order's allocations", async () => {
      const allocationRepo = testDataSource.getRepository(Allocation);
      const expectedAllocations = await allocationRepo.find({
        where: { orderId },
      });
      expect(expectedAllocations.length).toBeGreaterThan(0);

      const deleteMultipleSpy = jest
        .spyOn(service, 'deleteMultiple')
        .mockResolvedValue(undefined);

      await service.freeAllByOrder(orderId);

      expect(deleteMultipleSpy).toHaveBeenCalledWith(
        expectedAllocations,
        undefined,
      );

      deleteMultipleSpy.mockRestore();
    });
  });

  describe('updateOrderAllocations', () => {
    const runInTransaction = (order: Order, dto: UpdateAllocationsDto) =>
      testDataSource.transaction((manager) =>
        service.updateOrderAllocations(order, dto, manager),
      );

    it('throws when an entry has both an allocation id and a donation item id', async () => {
      const order = await insertOrder(await getFmId(FOODCORP));
      const dto: UpdateAllocationsDto = {
        allocations: [
          { allocationId: 1, donationItemId: 1, allocatedQuantity: 5 },
        ],
      };

      await expect(runInTransaction(order, dto)).rejects.toThrow(
        new BadRequestException(
          'Each allocation may only contain one of: allocation id OR donation item id',
        ),
      );
    });

    it('throws on duplicate allocation ids', async () => {
      const order = await insertOrder(await getFmId(FOODCORP));
      const dto: UpdateAllocationsDto = {
        allocations: [
          { allocationId: 1, allocatedQuantity: 5 },
          { allocationId: 1, allocatedQuantity: 3 },
        ],
      };

      await expect(runInTransaction(order, dto)).rejects.toThrow(
        new BadRequestException('Duplicate allocation ID 1 in request'),
      );
    });

    it('throws on duplicate donation item ids', async () => {
      const order = await insertOrder(await getFmId(FOODCORP));
      const dto: UpdateAllocationsDto = {
        allocations: [
          { donationItemId: 1, allocatedQuantity: 5 },
          { donationItemId: 1, allocatedQuantity: 3 },
        ],
      };

      await expect(runInTransaction(order, dto)).rejects.toThrow(
        new BadRequestException('Duplicate donation item ID 1 in request'),
      );
    });

    it('throws when an entry has neither an allocation id nor a donation item id', async () => {
      const order = await insertOrder(await getFmId(FOODCORP));
      const dto: UpdateAllocationsDto = {
        allocations: [{ allocatedQuantity: 5 }],
      };

      await expect(runInTransaction(order, dto)).rejects.toThrow(
        new BadRequestException(
          'Each allocation must include either an allocationId or a donationItemId',
        ),
      );
    });

    it('throws when an edited allocation does not belong to the order', async () => {
      const fmId = await getFmId(FOODCORP);
      const order = await insertOrder(fmId);
      const donationId = await insertDonationForFm(fmId);
      const itemId = await insertItem(donationId, 20, 10);
      const allocA = await insertAllocation(order.orderId, itemId, 5);
      const allocB = await insertAllocation(order.orderId, itemId, 5);

      const dto: UpdateAllocationsDto = {
        allocations: [
          { allocationId: allocA, allocatedQuantity: 5 },
          { allocationId: allocB, allocatedQuantity: 5 },
          { allocationId: 999999, allocatedQuantity: 5 },
        ],
      };

      await expect(runInTransaction(order, dto)).rejects.toThrow(
        new BadRequestException(
          `Allocation 999999 does not belong to order ${order.orderId}`,
        ),
      );
    });

    it("throws when a donation item does not belong to the order's manufacturer", async () => {
      const fmId = await getFmId(FOODCORP);
      const order = await insertOrder(fmId);
      const otherDonationId = await insertDonationForFm(
        await getFmId(OTHER_FM),
      );
      const otherItemId = await insertItem(otherDonationId, 20, 0);

      const dto: UpdateAllocationsDto = {
        allocations: [{ donationItemId: otherItemId, allocatedQuantity: 5 }],
      };

      await expect(runInTransaction(order, dto)).rejects.toThrow(
        new BadRequestException(
          `The following donation items are not associated with the order's food manufacturer: Donation item ID ${otherItemId} with Donation ID ${otherDonationId}`,
        ),
      );
    });

    it('throws when an allocated quantity exceeds the remaining quantity', async () => {
      const fmId = await getFmId(FOODCORP);
      const order = await insertOrder(fmId);
      const donationId = await insertDonationForFm(fmId);
      const itemId = await insertItem(donationId, 10, 10);
      const allocId = await insertAllocation(order.orderId, itemId, 10);

      const dto: UpdateAllocationsDto = {
        allocations: [{ allocationId: allocId, allocatedQuantity: 11 }],
      };

      await expect(runInTransaction(order, dto)).rejects.toThrow(
        new BadRequestException(
          `Donation item ${itemId} allocated quantity exceeds remaining quantity`,
        ),
      );
    });

    it('throws when a donation item would have a negative reserved quantity', async () => {
      const fmId = await getFmId(FOODCORP);
      const order = await insertOrder(fmId);
      const donationId = await insertDonationForFm(fmId);
      const itemId = await insertItem(donationId, 20, 3);
      const allocId = await insertAllocation(order.orderId, itemId, 10);

      const dto: UpdateAllocationsDto = {
        allocations: [{ allocationId: allocId, allocatedQuantity: 0 }],
      };

      await expect(runInTransaction(order, dto)).rejects.toThrow(
        new BadRequestException(
          `Donation item ${itemId} would have a negative reserved quantity`,
        ),
      );
    });

    it('rolls back every change when recheckDonationAllocationStatus fails', async () => {
      const fmId = await getFmId(FOODCORP);
      const order = await insertOrder(fmId);
      const donationId = await insertDonationForFm(fmId);
      const itemA = await insertItem(donationId, 20, 5);
      const itemB = await insertItem(donationId, 20, 4);
      const itemC = await insertItem(donationId, 20, 0);
      const allocA = await insertAllocation(order.orderId, itemA, 5);
      const allocB = await insertAllocation(order.orderId, itemB, 4);

      const allocationRepo = testDataSource.getRepository(Allocation);
      const itemRepo = testDataSource.getRepository(DonationItem);

      const updateSpy = jest.spyOn(Repository.prototype, 'update');
      const deleteSpy = jest.spyOn(service, 'deleteMultiple');
      const createSpy = jest.spyOn(service, 'createMultiple');
      mockDonationService.recheckDonationAllocationStatus.mockRejectedValueOnce(
        new Error('DB error'),
      );

      const dto: UpdateAllocationsDto = {
        allocations: [
          { allocationId: allocA, allocatedQuantity: 8 },
          // allocB omitted -> delete
          { donationItemId: itemC, allocatedQuantity: 6 },
        ],
      };

      await expect(runInTransaction(order, dto)).rejects.toThrow('DB error');

      // Make sure everything was still called
      expect(updateSpy).toHaveBeenCalled();
      expect(deleteSpy).toHaveBeenCalled();
      expect(createSpy).toHaveBeenCalled();
      expect(
        mockDonationService.recheckDonationAllocationStatus,
      ).toHaveBeenCalled();

      // Make sure it all rolled back
      expect(
        (await allocationRepo.findOneBy({ allocationId: allocA }))
          ?.allocatedQuantity,
      ).toBe(5);
      expect(
        await allocationRepo.findOneBy({ allocationId: allocB }),
      ).not.toBeNull();
      expect(
        await allocationRepo.findBy({ orderId: order.orderId, itemId: itemC }),
      ).toHaveLength(0);
      expect(
        (await itemRepo.findOneBy({ itemId: itemA }))?.reservedQuantity,
      ).toBe(5);
      expect(
        (await itemRepo.findOneBy({ itemId: itemB }))?.reservedQuantity,
      ).toBe(4);
      expect(
        (await itemRepo.findOneBy({ itemId: itemC }))?.reservedQuantity,
      ).toBe(0);
    });

    it('updates, deletes, and creates allocations and rechecks the affected donation', async () => {
      const fmId = await getFmId(FOODCORP);
      const order = await insertOrder(fmId);
      const donationId = await insertDonationForFm(fmId);
      const itemA = await insertItem(donationId, 20, 5);
      const itemB = await insertItem(donationId, 20, 4);
      const itemC = await insertItem(donationId, 20, 0);
      const allocA = await insertAllocation(order.orderId, itemA, 5);
      const allocB = await insertAllocation(order.orderId, itemB, 4);

      const allocationRepo = testDataSource.getRepository(Allocation);
      const itemRepo = testDataSource.getRepository(DonationItem);

      const updateSpy = jest.spyOn(Repository.prototype, 'update');
      const deleteSpy = jest.spyOn(service, 'deleteMultiple');
      const createSpy = jest.spyOn(service, 'createMultiple');

      const dto: UpdateAllocationsDto = {
        allocations: [
          { allocationId: allocA, allocatedQuantity: 8 },
          // allocB omitted -> delete
          { donationItemId: itemC, allocatedQuantity: 6 },
        ],
      };

      await runInTransaction(order, dto);

      expect(updateSpy).toHaveBeenCalledWith(allocA, { allocatedQuantity: 8 });
      expect(
        (await allocationRepo.findOneBy({ allocationId: allocA }))
          ?.allocatedQuantity,
      ).toBe(8);

      // deleteMultiple is called as (allocations, transactionManager), so the
      // trailing manager arg must be matched too.
      expect(deleteSpy).toHaveBeenCalledWith(
        [expect.objectContaining({ itemId: itemB, allocatedQuantity: 4 })],
        expect.any(EntityManager),
      );
      expect(
        await allocationRepo.findOneBy({ allocationId: allocB }),
      ).toBeNull();

      expect(createSpy).toHaveBeenCalledWith(
        order.orderId,
        new Map([[itemC, 6]]),
        expect.any(EntityManager),
      );
      const createdC = await allocationRepo.findBy({
        orderId: order.orderId,
        itemId: itemC,
      });
      expect(createdC).toHaveLength(1);
      expect(createdC[0].allocatedQuantity).toBe(6);

      expect(
        (await itemRepo.findOneBy({ itemId: itemA }))?.reservedQuantity,
      ).toBe(
        8, // 5 + 3
      );
      expect(
        (await itemRepo.findOneBy({ itemId: itemB }))?.reservedQuantity,
      ).toBe(
        0, // 4 - 4
      );
      expect(
        (await itemRepo.findOneBy({ itemId: itemC }))?.reservedQuantity,
      ).toBe(
        6, // 0 + 6
      );

      // affected donation rechecked (called with the donation ids and the manager).
      expect(
        mockDonationService.recheckDonationAllocationStatus,
      ).toHaveBeenCalledWith([donationId], expect.any(EntityManager));
    });

    it('never calls the update repo when there are no allocations to update', async () => {
      const fmId = await getFmId(FOODCORP);
      const order = await insertOrder(fmId);
      const donationId = await insertDonationForFm(fmId);
      const itemC = await insertItem(donationId, 20, 0);

      const updateSpy = jest.spyOn(Repository.prototype, 'update');

      const dto: UpdateAllocationsDto = {
        allocations: [{ donationItemId: itemC, allocatedQuantity: 6 }],
      };

      await runInTransaction(order, dto);

      expect(updateSpy).not.toHaveBeenCalled();
    });

    it('never calls the delete repo when there are no allocations to delete', async () => {
      const fmId = await getFmId(FOODCORP);
      const order = await insertOrder(fmId);
      const donationId = await insertDonationForFm(fmId);
      const itemA = await insertItem(donationId, 20, 5);
      const allocA = await insertAllocation(order.orderId, itemA, 5);

      const removeSpy = jest.spyOn(Repository.prototype, 'remove');

      const dto: UpdateAllocationsDto = {
        allocations: [{ allocationId: allocA, allocatedQuantity: 8 }],
      };

      await runInTransaction(order, dto);

      expect(removeSpy).not.toHaveBeenCalled();
    });

    it('never calls createMultiple when there are no allocations to create', async () => {
      const fmId = await getFmId(FOODCORP);
      const order = await insertOrder(fmId);
      const donationId = await insertDonationForFm(fmId);
      const itemA = await insertItem(donationId, 20, 5);
      const allocA = await insertAllocation(order.orderId, itemA, 5);

      const createSpy = jest.spyOn(service, 'createMultiple');

      const dto: UpdateAllocationsDto = {
        allocations: [{ allocationId: allocA, allocatedQuantity: 8 }],
      };

      await runInTransaction(order, dto);

      expect(createSpy).not.toHaveBeenCalled();
    });
  });
});
