import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Order } from './order.entity';
import { OrdersService } from './order.service';
import { mock } from 'jest-mock-extended';

const mockOrdersRepository = mock<Repository<Order>>();
const qb = mock<SelectQueryBuilder<Order>>();

describe('OrdersService', () => {
  let service: OrdersService;

  beforeAll(async () => {
    jest.resetAllMocks();

    const app = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: getRepositoryToken(Order),
          useValue: mockOrdersRepository,
        },
      ],
    }).compile();

    service = app.get<OrdersService>(OrdersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAll', () => {
    beforeEach(() => {
      qb.leftJoin.mockReturnThis();
      qb.select.mockReturnThis();
      qb.andWhere.mockReturnThis();
      qb.getMany.mockResolvedValue([]);

      mockOrdersRepository.createQueryBuilder.mockReturnValue(qb);
    });

    it('should return orders filtered by status', async () => {
      const mockOrders = [
        { orderId: 1, status: 'pending' } as Order,
        { orderId: 2, status: 'delivered' } as Order,
      ];

      qb.getMany.mockResolvedValue(mockOrders);

      const result = await service.getAll({ status: 'pending' });

      expect(result).toEqual([mockOrders[0]]);
      expect(qb.andWhere).toHaveBeenCalledWith('order.status = :status', {
        status: 'pending',
      });
    });

    it('should return empty array when no status filters match', async () => {
      qb.getMany.mockResolvedValue([]);

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
          orderId: 3,
          status: 'delivered',
          pantry: { pantryName: 'Test Pantry 2' },
        } as Order,
      ];

      qb.getMany.mockResolvedValue(mockOrders);

      const result = await service.getAll({ pantryName: 'Test Pantry' });

      expect(result).toEqual([mockOrders[0]]);
      expect(qb.andWhere).toHaveBeenCalledWith('pantry.name = :pantryName', {
        pantryName: 'Test Pantry',
      });
    });

    it('should return empty array when no pantryName filters match', async () => {
      qb.getMany.mockResolvedValue([]);

      const result = await service.getAll({ pantryName: 'Nonexistent Pantry' });

      expect(result).toEqual([]);
      expect(qb.andWhere).toHaveBeenCalledWith('pantry.name = :pantryName', {
        pantryName: 'Nonexistent Pantry',
      });
    });
  });
});
