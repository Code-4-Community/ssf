import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FoodRequest } from './request.entity';
import { RequestsService } from './request.service';
import { mock } from 'jest-mock-extended';
import { Pantry } from '../pantries/pantries.entity';
import { RequestSize } from './types';
import { Order } from '../orders/order.entity';
import { OrderStatus } from '../orders/types';
import { FoodManufacturer } from '../foodManufacturers/manufacturers.entity';
import { FoodType } from '../donationItems/types';
import { DonationItem } from '../donationItems/donationItems.entity';
import { Allocation } from '../allocations/allocations.entity';

const mockRequestsRepository = mock<Repository<FoodRequest>>();
const mockPantryRepository = mock<Repository<Pantry>>();
const mockOrdersRepository = mock<Repository<Order>>();

const mockRequest: FoodRequest = {
  requestId: 1,
  pantryId: 1,
  requestedItems: ['Canned Goods', 'Vegetables'],
  additionalInformation: 'No onions, please.',
  requestedAt: null,
  orders: null,
};

describe('RequestsService', () => {
  let service: RequestsService;

  beforeAll(async () => {
    // Reset the mock repository before compiling module
    mockRequestsRepository.findOne.mockReset();
    mockRequestsRepository.create.mockReset();
    mockRequestsRepository.save.mockReset();
    mockRequestsRepository.find.mockReset();
    mockPantryRepository.findOneBy.mockReset();

    const module = await Test.createTestingModule({
      providers: [
        RequestsService,
        {
          provide: getRepositoryToken(FoodRequest),
          useValue: mockRequestsRepository,
        },
        {
          provide: getRepositoryToken(Pantry),
          useValue: mockPantryRepository,
        },
        {
          provide: getRepositoryToken(Order),
          useValue: mockOrdersRepository,
        },
      ],
    }).compile();

    service = module.get<RequestsService>(RequestsService);
  });

  beforeEach(() => {
    mockRequestsRepository.findOne.mockReset();
    mockRequestsRepository.create.mockReset();
    mockRequestsRepository.save.mockReset();
    mockRequestsRepository.find.mockReset();
    mockPantryRepository.findOneBy.mockReset();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should return a food request with the corresponding id', async () => {
      const requestId = 1;
      mockRequestsRepository.findOne.mockResolvedValueOnce(
        mockRequest as FoodRequest,
      );
      const result = await service.findOne(requestId);
      expect(result).toEqual(mockRequest);
      expect(mockRequestsRepository.findOne).toHaveBeenCalledWith({
        where: { requestId },
        relations: ['orders'],
      });
    });

    it('should throw an error if the request id is not found', async () => {
      const requestId = 999;

      mockRequestsRepository.findOne.mockResolvedValueOnce(null);

      await expect(service.findOne(requestId)).rejects.toThrow(
        `Request ${requestId} not found`,
      );

      expect(mockRequestsRepository.findOne).toHaveBeenCalledWith({
        where: { requestId },
        relations: ['orders'],
      });
    });
  });

  describe('getOrderDetails', () => {
    it('should return mapped order details for a valid requestId', async () => {
      const requestId = 1;

      const mockOrders: Partial<Order>[] = [
        {
          orderId: 10,
          status: OrderStatus.DELIVERED,
          foodManufacturer: {
            foodManufacturerName: 'Test Manufacturer',
          } as FoodManufacturer,
          allocations: [
            {
              allocatedQuantity: 5,
              item: {
                itemName: 'Rice',
                foodType: FoodType.GRANOLA,
              } as DonationItem,
            } as Allocation,
            {
              allocatedQuantity: 3,
              item: {
                itemName: 'Beans',
                foodType: FoodType.DRIED_BEANS,
              } as DonationItem,
            } as Allocation,
          ],
        },
        {
          orderId: 11,
          status: OrderStatus.SHIPPED,
          foodManufacturer: {
            foodManufacturerName: 'Another Manufacturer',
          } as FoodManufacturer,
          allocations: [
            {
              allocatedQuantity: 2,
              item: {
                itemName: 'Milk',
                foodType: FoodType.DAIRY_FREE_ALTERNATIVES,
              } as DonationItem,
            } as Allocation,
          ],
        },
      ];

      mockOrdersRepository.find.mockResolvedValueOnce(mockOrders as Order[]);

      mockRequestsRepository.findOne.mockResolvedValueOnce(
        mockRequest as FoodRequest,
      );

      const result = await service.getOrderDetails(requestId);

      expect(result).toEqual([
        {
          orderId: 10,
          status: OrderStatus.DELIVERED,
          foodManufacturerName: 'Test Manufacturer',
          items: [
            {
              name: 'Rice',
              quantity: 5,
              foodType: FoodType.GRANOLA,
            },
            {
              name: 'Beans',
              quantity: 3,
              foodType: FoodType.DRIED_BEANS,
            },
          ],
        },
        {
          orderId: 11,
          status: OrderStatus.SHIPPED,
          foodManufacturerName: 'Another Manufacturer',
          items: [
            {
              name: 'Milk',
              quantity: 2,
              foodType: FoodType.DAIRY_FREE_ALTERNATIVES,
            },
          ],
        },
      ]);

      expect(mockOrdersRepository.find).toHaveBeenCalledWith({
        where: { requestId },
        relations: {
          foodManufacturer: true,
          allocations: {
            item: true,
          },
        },
      });
    });

    it('should throw an error if the request id is not found', async () => {
      const requestId = 999;

      await expect(service.getOrderDetails(requestId)).rejects.toThrow(
        `Request ${requestId} not found`,
      );
    });

    it('should return empty list if no associated orders', async () => {
      const requestId = 1;

      mockRequestsRepository.findOne.mockResolvedValueOnce(
        mockRequest as FoodRequest,
      );
      mockOrdersRepository.find.mockResolvedValueOnce([]);

      const result = await service.getOrderDetails(requestId);
      expect(result).toEqual([]);
      expect(mockOrdersRepository.find).toHaveBeenCalledWith({
        where: { requestId },
        relations: {
          foodManufacturer: true,
          allocations: {
            item: true,
          },
        },
      });
    });
  });

  describe('create', () => {
    it('should successfully create and return a new food request', async () => {
      mockPantryRepository.findOneBy.mockResolvedValueOnce({
        pantryId: 1,
      } as unknown as Pantry);
      mockRequestsRepository.create.mockReturnValueOnce(
        mockRequest as FoodRequest,
      );
      mockRequestsRepository.save.mockResolvedValueOnce(
        mockRequest as FoodRequest,
      );
      mockRequestsRepository.find.mockResolvedValueOnce([
        mockRequest as FoodRequest,
      ]);

      const result = await service.create(
        mockRequest.pantryId,
        mockRequest.requestedSize,
        mockRequest.requestedItems,
        mockRequest.additionalInformation ?? undefined,
      );

      expect(result).toEqual(mockRequest);
      expect(mockRequestsRepository.create).toHaveBeenCalledWith({
        pantryId: mockRequest.pantryId,
        requestedSize: mockRequest.requestedSize,
        requestedItems: mockRequest.requestedItems,
        additionalInformation: mockRequest.additionalInformation,
      });
      expect(mockRequestsRepository.save).toHaveBeenCalledWith(mockRequest);
    });

    it('should throw an error if the pantry ID does not exist', async () => {
      const invalidPantryId = 999;

      await expect(
        service.create(
          invalidPantryId,
          RequestSize.MEDIUM,
          ['Canned Goods', 'Vegetables'],
          'Additional info',
        ),
      ).rejects.toThrow(`Pantry ${invalidPantryId} not found`);

      expect(mockRequestsRepository.create).not.toHaveBeenCalled();
      expect(mockRequestsRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('find', () => {
    it('should return all food requests for a specific pantry', async () => {
      const mockRequests: Partial<FoodRequest>[] = [
        mockRequest,
        {
          requestId: 2,
          pantryId: 1,
          requestedSize: RequestSize.LARGE,
          requestedItems: ['Rice', 'Beans'],
          additionalInformation: 'Gluten-free items only.',
          requestedAt: null,
          orders: null,
        },
        {
          requestId: 3,
          pantryId: 2,
          requestedSize: RequestSize.SMALL,
          requestedItems: ['Fruits', 'Snacks'],
          additionalInformation: 'No nuts, please.',
          requestedAt: null,
          orders: null,
        },
      ];
      const pantryId = 1;
      mockRequestsRepository.find.mockResolvedValueOnce(
        mockRequests.slice(0, 2) as FoodRequest[],
      );

      const result = await service.find(pantryId);

      expect(result).toEqual(mockRequests.slice(0, 2));
      expect(mockRequestsRepository.find).toHaveBeenCalledWith({
        where: { pantryId },
        relations: ['orders'],
      });
    });
  });
});
