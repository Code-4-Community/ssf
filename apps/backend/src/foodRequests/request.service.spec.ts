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

const mockRequestsRepository = mock<Repository<FoodRequest>>();
const mockPantryRepository = mock<Repository<Pantry>>();

const mockRequest: Partial<FoodRequest> = {
  requestId: 1,
  pantryId: 1,
  requestedItems: ['Canned Goods', 'Vegetables'],
  additionalInformation: 'No onions, please.',
  requestedAt: null,
  dateReceived: null,
  feedback: null,
  photos: null,
  order: null,
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
        relations: ['order'],
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
        relations: ['order'],
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
        mockRequest.additionalInformation,
        mockRequest.dateReceived,
        mockRequest.feedback,
        mockRequest.photos,
      );

      expect(result).toEqual(mockRequest);
      expect(mockRequestsRepository.create).toHaveBeenCalledWith({
        pantryId: mockRequest.pantryId,
        requestedSize: mockRequest.requestedSize,
        requestedItems: mockRequest.requestedItems,
        additionalInformation: mockRequest.additionalInformation,
        dateReceived: mockRequest.dateReceived,
        feedback: mockRequest.feedback,
        photos: mockRequest.photos,
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
          null,
          null,
          null,
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
          dateReceived: null,
          feedback: null,
          photos: null,
          order: null,
        },
        {
          requestId: 3,
          pantryId: 2,
          requestedSize: RequestSize.SMALL,
          requestedItems: ['Fruits', 'Snacks'],
          additionalInformation: 'No nuts, please.',
          requestedAt: null,
          dateReceived: null,
          feedback: null,
          photos: null,
          order: null,
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
        relations: ['order'],
      });
    });
  });

  describe('updateDeliveryDetails', () => {
    it('should update and return the food request with new delivery details', async () => {
      const mockOrder: Partial<Order> = {
        orderId: 1,
        pantry: null,
        request: null,
        requestId: 1,
        foodManufacturer: null,
        shippedBy: 1,
        status: OrderStatus.SHIPPED,
        createdAt: new Date(),
        shippedAt: new Date(),
        deliveredAt: null,
      };

      const mockRequest2: Partial<FoodRequest> = {
        ...mockRequest,
        order: mockOrder as Order,
      };

      const requestId = 1;
      const deliveryDate = new Date();
      const feedback = 'Good delivery!';
      const photos = ['photo1.jpg', 'photo2.jpg'];

      mockRequestsRepository.findOne.mockResolvedValueOnce(
        mockRequest2 as FoodRequest,
      );
      mockRequestsRepository.save.mockResolvedValueOnce({
        ...mockRequest,
        dateReceived: deliveryDate,
        feedback,
        photos,
        order: {
          ...(mockOrder as Order),
          status: OrderStatus.DELIVERED,
        } as Order,
      } as FoodRequest);

      const result = await service.updateDeliveryDetails(
        requestId,
        deliveryDate,
        feedback,
        photos,
      );

      expect(result).toEqual({
        ...mockRequest,
        dateReceived: deliveryDate,
        feedback,
        photos,
        order: { ...mockOrder, status: 'delivered' },
      });

      expect(mockRequestsRepository.findOne).toHaveBeenCalledWith({
        where: { requestId },
        relations: ['order'],
      });

      expect(mockRequestsRepository.save).toHaveBeenCalledWith({
        ...mockRequest,
        dateReceived: deliveryDate,
        feedback,
        photos,
        order: { ...mockOrder, status: 'delivered' },
      });
    });

    it('should throw an error if the request ID is invalid', async () => {
      const requestId = 999;
      const deliveryDate = new Date();
      const feedback = 'Good delivery!';
      const photos = ['photo1.jpg', 'photo2.jpg'];

      mockRequestsRepository.findOne.mockResolvedValueOnce(null);

      await expect(
        service.updateDeliveryDetails(
          requestId,
          deliveryDate,
          feedback,
          photos,
        ),
      ).rejects.toThrow('Invalid request ID');

      expect(mockRequestsRepository.findOne).toHaveBeenCalledWith({
        where: { requestId },
        relations: ['order'],
      });
    });

    it('should throw an error if there is no associated order', async () => {
      const requestId = 1;
      const deliveryDate = new Date();
      const feedback = 'Good delivery!';
      const photos = ['photo1.jpg', 'photo2.jpg'];

      mockRequestsRepository.findOne.mockResolvedValueOnce(
        mockRequest as FoodRequest,
      );

      await expect(
        service.updateDeliveryDetails(
          requestId,
          deliveryDate,
          feedback,
          photos,
        ),
      ).rejects.toThrow('No associated order found for this request');

      expect(mockRequestsRepository.findOne).toHaveBeenCalledWith({
        where: { requestId },
        relations: ['order'],
      });
    });

    it('should throw an error if the order does not have a food manufacturer', async () => {
      const mockOrder: Partial<Order> = {
        orderId: 1,
        pantry: null,
        request: null,
        requestId: 1,
        foodManufacturer: null,
        shippedBy: null,
        status: OrderStatus.SHIPPED,
        createdAt: new Date(),
        shippedAt: new Date(),
        deliveredAt: null,
      };
      const mockRequest2: Partial<FoodRequest> = {
        ...mockRequest,
        order: mockOrder as Order,
      };

      const requestId = 1;
      const deliveryDate = new Date();
      const feedback = 'Good delivery!';
      const photos = ['photo1.jpg', 'photo2.jpg'];

      mockRequestsRepository.findOne.mockResolvedValueOnce(
        mockRequest2 as FoodRequest,
      );

      await expect(
        service.updateDeliveryDetails(
          requestId,
          deliveryDate,
          feedback,
          photos,
        ),
      ).rejects.toThrow('No associated food manufacturer found for this order');

      expect(mockRequestsRepository.findOne).toHaveBeenCalledWith({
        where: { requestId },
        relations: ['order'],
      });
    });
  });
});