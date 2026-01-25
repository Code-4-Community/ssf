import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Order } from './order.entity';
import { OrdersService } from './order.service';
import { mock } from 'jest-mock-extended';
import { Pantry } from '../pantries/pantries.entity';
import { User } from '../users/user.entity';
import {
  AllergensConfidence,
  ClientVisitFrequency,
  PantryStatus,
  RefrigeratedDonation,
  ServeAllergicChildren,
} from '../pantries/types';
import { OrderStatus } from './types';

const mockOrdersRepository = mock<Repository<Order>>();
const mockPantryRepository = mock<Repository<Pantry>>();

const mockPantry: Partial<Pantry> = {
  pantryId: 1,
  pantryName: 'Test Pantry',
  allergenClients: '',
  refrigeratedDonation: RefrigeratedDonation.NO,
  reserveFoodForAllergic: 'Yes',
  reservationExplanation: '',
  dedicatedAllergyFriendly: false,
  clientVisitFrequency: ClientVisitFrequency.DAILY,
  identifyAllergensConfidence: AllergensConfidence.NOT_VERY_CONFIDENT,
  serveAllergicChildren: ServeAllergicChildren.NO,
  newsletterSubscription: false,
  restrictions: [],
  pantryUser: null as unknown as User,
  status: PantryStatus.APPROVED,
  dateApplied: new Date(),
  activities: [],
  activitiesComments: '',
  itemsInStock: '',
  needMoreOptions: '',
  volunteers: [],
};

describe('OrdersService', () => {
  let service: OrdersService;
  let qb: SelectQueryBuilder<Order>;

  beforeAll(async () => {
    mockOrdersRepository.createQueryBuilder.mockReset();

    const module = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: getRepositoryToken(Order),
          useValue: mockOrdersRepository,
        },
        {
          provide: getRepositoryToken(Pantry),
          useValue: mockPantryRepository,
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  beforeEach(() => {
    qb = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      leftJoin: jest.fn().mockReturnThis(),
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
      const mockOrders: Partial<Order>[] = [
        { orderId: 1, status: OrderStatus.PENDING },
        { orderId: 2, status: OrderStatus.DELIVERED },
      ];

      (qb.getMany as jest.Mock).mockResolvedValue([mockOrders[0] as Order]);

      const result = await service.getAll({ status: OrderStatus.PENDING });

      expect(result).toEqual([mockOrders[0]]);
      expect(qb.andWhere).toHaveBeenCalledWith('order.status = :status', {
        status: OrderStatus.PENDING,
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
      const mockOrders: Partial<Order>[] = [
        {
          orderId: 3,
          status: OrderStatus.DELIVERED,
        },
        {
          orderId: 4,
          status: OrderStatus.DELIVERED,
        },
        {
          orderId: 5,
          status: OrderStatus.DELIVERED,
        },
      ];

      (qb.getMany as jest.Mock).mockResolvedValue(
        mockOrders.slice(0, 2) as Order[],
      );

      const result = await service.getAll({
        pantryNames: ['Test Pantry', 'Test Pantry 2'],
      });

      expect(result).toEqual(mockOrders.slice(0, 2) as Order[]);
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
      const mockOrders: Partial<Order>[] = [
        {
          orderId: 3,
          status: OrderStatus.DELIVERED,
        },
        {
          orderId: 4,
          status: OrderStatus.DELIVERED,
        },
        {
          orderId: 5,
          status: OrderStatus.DELIVERED,
        },
      ];

      (qb.getMany as jest.Mock).mockResolvedValue(
        mockOrders.slice(1, 3) as Order[],
      );

      const result = await service.getAll({
        status: 'delivered',
        pantryNames: ['Test Pantry 2'],
      });

      expect(result).toEqual(mockOrders.slice(1, 3) as Order[]);
      expect(qb.andWhere).toHaveBeenCalledWith('order.status = :status', {
        status: 'delivered',
      });
      expect(qb.andWhere).toHaveBeenCalledWith(
        'pantry.pantryName IN (:...pantryNames)',
        { pantryNames: ['Test Pantry 2'] },
      );
    });
  });

  describe('findOrderPantry', () => {
    it('should return pantry for given order', async () => {
      const mockFoodRequest = {
        requestId: 1,
        pantryId: 1,
      };

      const mockOrder = {
        orderId: 1,
        requestId: 1,
        request: mockFoodRequest,
      };

      (mockOrdersRepository.findOne as jest.Mock).mockResolvedValue(mockOrder);
      (mockPantryRepository.findOneBy as jest.Mock).mockResolvedValue(
        mockPantry as Pantry,
      );

      const result = await service.findOrderPantry(1);

      expect(result).toEqual(mockPantry);
      expect(mockPantryRepository.findOneBy).toHaveBeenCalledWith({
        pantryId: 1,
      });
    });

    it('should throw NotFoundException if order not found', async () => {
      (mockOrdersRepository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.findOrderPantry(999)).rejects.toThrow(
        'Order 999 not found',
      );
    });

    it('should throw NotFoundException if pantry not found', async () => {
      const mockFoodRequest = {
        requestId: 1,
        pantryId: 999,
      };

      const mockOrder = {
        orderId: 1,
        requestId: 1,
        request: mockFoodRequest,
      };

      (mockOrdersRepository.findOne as jest.Mock).mockResolvedValue(mockOrder);
      (mockPantryRepository.findOneBy as jest.Mock).mockResolvedValue(null);

      await expect(service.findOrderPantry(1)).rejects.toThrow(
        'Pantry 999 not found',
      );
    });
  });

  describe('getOrdersByPantry', () => {
    it('should return orders for given pantry', async () => {
      const mockOrders: Partial<Order>[] = [
        { orderId: 1, requestId: 1 },
        { orderId: 2, requestId: 2 },
      ];

      (mockPantryRepository.findOneBy as jest.Mock).mockResolvedValue(
        mockPantry as Pantry,
      );
      (mockOrdersRepository.find as jest.Mock).mockResolvedValue(
        mockOrders as Order[],
      );

      const result = await service.getOrdersByPantry(1);

      expect(result).toEqual(mockOrders);
      expect(mockPantryRepository.findOneBy).toHaveBeenCalledWith({
        pantryId: 1,
      });
      expect(mockOrdersRepository.find).toHaveBeenCalledWith({
        where: { request: { pantryId: 1 } },
        relations: ['request'],
      });
    });

    it('should throw NotFoundException if pantry does not exist', async () => {
      (mockPantryRepository.findOneBy as jest.Mock).mockResolvedValue(null);

      await expect(service.getOrdersByPantry(999)).rejects.toThrow(
        'Pantry 999 not found',
      );
    });

    it('should return empty array if pantry has no orders', async () => {
      (mockPantryRepository.findOneBy as jest.Mock).mockResolvedValue(
        mockPantry as Pantry,
      );
      (mockOrdersRepository.find as jest.Mock).mockResolvedValue([]);

      const result = await service.getOrdersByPantry(1);

      expect(result).toEqual([]);
    });
  });
});
