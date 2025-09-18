import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Order } from './order.entity';
import { OrdersService } from './order.service';

describe('OrdersService', () => {
  let service: OrdersService;
  let mockOrdersRepository: jest.Mocked<Repository<Order>>;

  beforeAll(async () => {
    mockOrdersRepository = {
      createQueryBuilder: jest.fn(),
    } as unknown as jest.Mocked<Repository<Order>>;

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
    const qb: SelectQueryBuilder<Order> = {
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

      const qb = mockOrdersRepository.createQueryBuilder();
      (qb.getMany as jest.Mock).mockResolvedValue(mockOrders[0]);

      const result = await service.getAll({ status: 'pending' });

      expect(result).toEqual(mockOrders[0]);
      expect(qb.andWhere).toHaveBeenCalledWith('order.status = :status', {
        status: 'pending',
      });
    });

    it('should return empty array when no status filters match', async () => {
      const qb = mockOrdersRepository.createQueryBuilder();
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
      ];

      const qb = mockOrdersRepository.createQueryBuilder();
      (qb.getMany as jest.Mock).mockResolvedValue(mockOrders);

      const result = await service.getAll({ pantryName: 'Test Pantry' });

      expect(result).toEqual(mockOrders);
      expect(qb.andWhere).toHaveBeenCalledWith(
        'pantry.pantryName = :pantryName',
        {
          pantryName: 'Test Pantry',
        },
      );
    });

    it('should return empty array when no pantryName filters match', async () => {
      const qb = mockOrdersRepository.createQueryBuilder();
      (qb.getMany as jest.Mock).mockResolvedValue([]);

      const result = await service.getAll({ pantryName: 'Nonexistent Pantry' });

      expect(result).toEqual([]);
      expect(qb.andWhere).toHaveBeenCalledWith(
        'pantry.pantryName = :pantryName',
        {
          pantryName: 'Nonexistent Pantry',
        },
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
        },
      ];

      const qb = mockOrdersRepository.createQueryBuilder();
      (qb.getMany as jest.Mock).mockResolvedValue(mockOrders.slice(1, 3));

      const result = await service.getAll({
        status: 'delivered',
        pantryName: 'Test Pantry 2',
      });

      expect(result).toEqual(mockOrders.slice(1, 3));
      expect(qb.andWhere).toHaveBeenCalledWith('order.status = :status', {
        status: 'delivered',
      });
      expect(qb.andWhere).toHaveBeenCalledWith(
        'pantry.pantryName = :pantryName',
        {
          pantryName: 'Test Pantry 2',
        },
      );
    });
  });
});
