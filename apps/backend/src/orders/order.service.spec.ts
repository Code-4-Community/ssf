import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Order } from './order.entity';
import { OrdersService } from './order.service';
import { mock } from 'jest-mock-extended';

const mockOrdersRepository = mock<Repository<Order>>();

describe('OrdersService', () => {
  let service: OrdersService;
  let qb: SelectQueryBuilder<Order>;

  beforeAll(async () => {
    // Reset the mock repository before compiling module
    mockOrdersRepository.createQueryBuilder.mockReset();

    const module = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: getRepositoryToken(Order),
          useValue: mockOrdersRepository,
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  beforeEach(() => {
    // Fresh query builder mock for each test
    qb = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
    } as unknown as SelectQueryBuilder<Order>;

    mockOrdersRepository.createQueryBuilder.mockReturnValue(qb);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAll', () => {
    it('should return orders filtered by status', async () => {
      const mockOrders = [
        { orderId: 1, status: 'pending' } as Order,
        { orderId: 2, status: 'delivered' } as Order,
      ];

      (qb.getMany as jest.Mock).mockResolvedValue([mockOrders[0]]);

      const result = await service.getAll({ status: 'pending' });

      expect(result).toEqual([mockOrders[0]]);
      expect(qb.andWhere).toHaveBeenCalledWith('order.status = :status', {
        status: 'pending',
      });
    });

    it('should return empty array when no status filters match', async () => {
      (qb.getMany as jest.Mock).mockResolvedValue([]);

      const result = await service.getAll({ status: 'invalid status' });

      expect(result).toEqual([]);
      expect(qb.andWhere).toHaveBeenCalledWith('order.status = :status', {
        status: 'invalid status',
      });
    });

    it('should return orders filtered by pantryName', async () => {
      const mockOrders = [
        {
          orderId: 3,
          status: 'delivered',
          pantry: { pantryName: 'Test Pantry' },
        } as Order,
        {
          orderId: 4,
          status: 'delivered',
          pantry: { pantryName: 'Test Pantry 2' },
        } as Order,
        {
          orderId: 5,
          status: 'delivered',
          pantry: { pantryName: 'Test Pantry 3' },
        } as Order,
      ];

      (qb.getMany as jest.Mock).mockResolvedValue(mockOrders.slice(0, 2));

      const result = await service.getAll({
        pantryNames: ['Test Pantry', 'Test Pantry 2'],
      });

      expect(result).toEqual(mockOrders.slice(0, 2));
      expect(qb.andWhere).toHaveBeenCalledWith(
        'pantry.pantryName IN (:...pantryNames)',
        { pantryNames: ['Test Pantry', 'Test Pantry 2'] },
      );
    });

    it('should return empty array when no pantryName filters match', async () => {
      (qb.getMany as jest.Mock).mockResolvedValue([]);

      const result = await service.getAll({
        pantryNames: ['Nonexistent Pantry'],
      });

      expect(result).toEqual([]);
      expect(qb.andWhere).toHaveBeenCalledWith(
        'pantry.pantryName IN (:...pantryNames)',
        { pantryNames: ['Nonexistent Pantry'] },
      );
    });

    it('should return orders filtered by both status and pantryName', async () => {
      const mockOrders = [
        {
          orderId: 3,
          status: 'delivered',
          pantry: { pantryName: 'Test Pantry' },
        } as Order,
        {
          orderId: 4,
          status: 'delivered',
          pantry: { pantryName: 'Test Pantry 2' },
        } as Order,
        {
          orderId: 5,
          status: 'delivered',
          pantry: { pantryName: 'Test Pantry 2' },
        } as Order,
      ];

      (qb.getMany as jest.Mock).mockResolvedValue(mockOrders.slice(1, 3));

      const result = await service.getAll({
        status: 'delivered',
        pantryNames: ['Test Pantry 2'],
      });

      expect(result).toEqual(mockOrders.slice(1, 3));
      expect(qb.andWhere).toHaveBeenCalledWith('order.status = :status', {
        status: 'delivered',
      });
      expect(qb.andWhere).toHaveBeenCalledWith(
        'pantry.pantryName IN (:...pantryNames)',
        { pantryNames: ['Test Pantry 2'] },
      );
    });
  });
});
