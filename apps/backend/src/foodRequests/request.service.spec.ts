import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FoodRequest } from './request.entity';
import { RequestsService } from './request.service';
import { mock } from 'jest-mock-extended';

const mockRequestsRepository = mock<Repository<FoodRequest>>();

describe('OrdersService', () => {
  let service: RequestsService;

  beforeAll(async () => {
    // Reset the mock repository before compiling module
    mockRequestsRepository.findOne.mockReset();
    mockRequestsRepository.create.mockReset();
    mockRequestsRepository.save.mockReset();
    mockRequestsRepository.find.mockReset();

    const module = await Test.createTestingModule({
      providers: [
        RequestsService,
        {
          provide: getRepositoryToken(FoodRequest),
          useValue: mockRequestsRepository,
        },
      ],
    }).compile();

    service = module.get<RequestsService>(RequestsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should return a food request with the corresponding id', async () => {
      const mockRequest = {
        requestId: 1,
        pantryId: 1,
        requestedSize: 'Medium (5-10 boxes)',
        requestedItems: ['Canned Goods', 'Vegetables'],
        additionalInformation: 'No onions, please.',
        requestedAt: null,
        dateReceived: null,
        feedback: null,
        photos: null,
        order: null,
      };
      const requestId = 1;
      mockRequestsRepository.findOne.mockResolvedValueOnce(mockRequest);
      const result = await service.findOne(requestId);
      expect(result).toEqual(mockRequest);
      expect(mockRequestsRepository.findOne).toHaveBeenCalledWith({
        where: { requestId },
        relations: ['order'],
      });
    });
  });

  describe('create', () => {
    it('should successfully create and return a new food request', async () => {
      const mockRequest = {
        requestId: 1,
        pantryId: 1,
        requestedSize: 'Medium (5-10 boxes)',
        requestedItems: ['Canned Goods', 'Vegetables'],
        additionalInformation: 'No onions, please.',
        requestedAt: null,
        dateReceived: null,
        feedback: null,
        photos: null,
        order: null,
      };

      mockRequestsRepository.create.mockReturnValueOnce(mockRequest);
      mockRequestsRepository.save.mockResolvedValueOnce(mockRequest);

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
  });

  describe('find', () => {
    it('should return all food requests for a specific pantry', async () => {
      const mockRequests = [
        {
          requestId: 1,
          pantryId: 1,
          requestedSize: 'Medium (5-10 boxes)',
          requestedItems: ['Canned Goods', 'Vegetables'],
          additionalInformation: 'No onions, please.',
          requestedAt: null,
          dateReceived: null,
          feedback: null,
          photos: null,
          order: null,
        },
        {
          requestId: 2,
          pantryId: 1,
          requestedSize: 'Large (10-20 boxes)',
          requestedItems: ['Rice', 'Beans'],
          additionalInformation: 'Gluten-free items only.',
          requestedAt: null,
          dateReceived: null,
          feedback: null,
          photos: null,
          order: null,
        },
      ];
      const pantryId = 1;
      mockRequestsRepository.find.mockResolvedValueOnce(mockRequests);

      const result = await service.find(pantryId);

      expect(result).toEqual(mockRequests);
      expect(mockRequestsRepository.find).toHaveBeenCalledWith({
        where: { pantryId },
        relations: ['order'],
      });
    });
  });

  describe('updateDeliveryDetails', () => {
    it('should update and return the food request with new delivery details', async () => {
      const mockOrder = {
        orderId: 1,
        shippedBy: 1,
        shippedAt: new Date(),
        status: 'shipped',
        trackingNumber: '123456789',
        requestId: 1,
        pantry: null,
        foodManufacturer: null,
        donation: null,
        deliveredAt: null,
        request: null,
        allocations: [],
        manufacturer: 1,
        fulfillmentCenter: null,
        foodItems: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      const mockRequest = {
        requestId: 1,
        pantryId: 1,
        requestedSize: 'Medium (5-10 boxes)',
        requestedItems: ['Canned Goods', 'Vegetables'],
        additionalInformation: 'No onions, please.',
        requestedAt: null,
        dateReceived: null,
        feedback: null,
        photos: null,
        order: mockOrder,
      };
      const requestId = 1;
      const deliveryDate = new Date();
      const feedback = 'Good delivery!';
      const photos = ['photo1.jpg', 'photo2.jpg'];

      mockRequestsRepository.findOne.mockResolvedValueOnce(mockRequest);
      mockRequestsRepository.save.mockResolvedValueOnce({
        ...mockRequest,
        dateReceived: deliveryDate,
        feedback,
        photos,
        order: { ...mockOrder, status: 'fulfilled' },
      });

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
        order: { ...mockOrder, status: 'fulfilled' },
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
        order: { ...mockOrder, status: 'fulfilled' },
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
      const mockRequest = {
        requestId: 1,
        pantryId: 1,
        requestedSize: 'Medium (5-10 boxes)',
        requestedItems: ['Canned Goods', 'Vegetables'],
        additionalInformation: 'No onions, please.',
        requestedAt: null,
        dateReceived: null,
        feedback: null,
        photos: null,
        order: null,
      };
      const requestId = 1;
      const deliveryDate = new Date();
      const feedback = 'Good delivery!';
      const photos = ['photo1.jpg', 'photo2.jpg'];

      mockRequestsRepository.findOne.mockResolvedValueOnce(mockRequest);

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
      const mockOrder = {
        orderId: 1,
        shippedBy: null,
        shippedAt: new Date(),
        status: 'shipped',
        trackingNumber: '123456789',
        requestId: 1,
        pantry: null,
        foodManufacturer: null,
        donation: null,
        deliveredAt: null,
        request: null,
        allocations: [],
        manufacturer: null,
        fulfillmentCenter: null,
        foodItems: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      const mockRequest = {
        requestId: 1,
        pantryId: 1,
        requestedSize: 'Medium (5-10 boxes)',
        requestedItems: ['Canned Goods', 'Vegetables'],
        additionalInformation: 'No onions, please.',
        requestedAt: null,
        dateReceived: null,
        feedback: null,
        photos: null,
        order: mockOrder,
      };
      const requestId = 1;
      const deliveryDate = new Date();
      const feedback = 'Good delivery!';
      const photos = ['photo1.jpg', 'photo2.jpg'];

      mockRequestsRepository.findOne.mockResolvedValueOnce(mockRequest);

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
