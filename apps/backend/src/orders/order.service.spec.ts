import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Order } from './order.entity';
import { OrdersService } from './order.service';
import { mock } from 'jest-mock-extended';
import { Pantry } from '../pantries/pantries.entity';
import { User } from '../users/user.entity';

const mockOrdersRepository = mock<Repository<Order>>();

const mockPantry: Pantry = {
  pantryId: 1,
  pantryName: 'Test Pantry',
  address: '123 Test St',
  allergenClients: '',
  refrigeratedDonation: '',
  reserveFoodForAllergic: false,
  reservationExplanation: '',
  dedicatedAllergyFriendly: '',
  clientVisitFrequency: '',
  identifyAllergensConfidence: '',
  serveAllergicChildren: '',
  newsletterSubscription: false,
  restrictions: [],
  ssfRepresentative: null as unknown as User,
  pantryRepresentative: null as unknown as User,
  status: 'active',
  dateApplied: new Date(),
  activities: '',
  questions: null,
  itemsInStock: '',
  needMoreOptions: '',
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
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  beforeEach(() => {
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
      const mockOrders: Partial<Order>[] = [
        { orderId: 1, status: 'pending' },
        { orderId: 2, status: 'delivered' },
      ];

      (qb.getMany as jest.Mock).mockResolvedValue([mockOrders[0] as Order]);

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
      const mockOrders: Partial<Order>[] = [
        {
          orderId: 3,
          status: 'delivered',
          pantry: { ...mockPantry, pantryName: 'Test Pantry' },
        },
        {
          orderId: 4,
          status: 'delivered',
          pantry: { ...mockPantry, pantryName: 'Test Pantry 2' },
        },
        {
          orderId: 5,
          status: 'delivered',
          pantry: { ...mockPantry, pantryName: 'Test Pantry 3' },
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
          status: 'delivered',
          pantry: { ...mockPantry, pantryName: 'Test Pantry 1' },
        },
        {
          orderId: 4,
          status: 'delivered',
          pantry: { ...mockPantry, pantryName: 'Test Pantry 2' },
        },
        {
          orderId: 5,
          status: 'delivered',
          pantry: { ...mockPantry, pantryName: 'Test Pantry 2' },
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
});
