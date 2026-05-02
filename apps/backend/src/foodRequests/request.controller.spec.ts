import { RequestsService } from './request.service';
import { RequestsController } from './request.controller';
import { Test, TestingModule } from '@nestjs/testing';
import { mock } from 'jest-mock-extended';
import { FoodRequest } from './request.entity';
import { FoodRequestStatus, RequestSize } from './types';
import { OrderStatus } from '../orders/types';
import { FoodType } from '../donationItems/types';
import { OrderDetailsDto } from '../orders/dtos/order-details.dto';
import { CreateRequestDto } from './dtos/create-request.dto';
import { UpdateRequestDto } from './dtos/update-request.dto';
import {
  DonationItemDetailsDto,
  MatchingItemsDto,
  MatchingManufacturersDto,
} from './dtos/matching.dto';
import { FoodManufacturer } from '../foodManufacturers/manufacturers.entity';
import { Pantry } from '../pantries/pantries.entity';

const mockRequestsService = mock<RequestsService>();

const foodRequest1: Partial<FoodRequest> = {
  requestId: 1,
  pantryId: 1,
  pantry: {
    pantryId: 1,
    pantryName: 'Test Pantry 1',
  } as Pantry,
};

const foodRequest2: Partial<FoodRequest> = {
  requestId: 2,
  pantryId: 2,
  pantry: {
    pantryId: 2,
    pantryName: 'Test Pantry 2',
  } as Pantry,
};

describe('RequestsController', () => {
  let controller: RequestsController;

  beforeEach(async () => {
    mockRequestsService.findOne.mockReset();
    mockRequestsService.create.mockReset();
    mockRequestsService.getOrderDetails.mockReset();
    mockRequestsService.update.mockReset();
    mockRequestsService.delete.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RequestsController],
      providers: [
        {
          provide: RequestsService,
          useValue: mockRequestsService,
        },
      ],
    }).compile();

    controller = module.get<RequestsController>(RequestsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /', () => {
    it('should call requestsService.getAll and return array of food requests', async () => {
      mockRequestsService.getAll.mockResolvedValueOnce([
        foodRequest1,
        foodRequest2,
      ] as FoodRequest[]);

      const result = await controller.getAllFoodRequests();

      expect(result).toEqual([foodRequest1, foodRequest2]);
      expect(mockRequestsService.getAll).toHaveBeenCalled();
    });
  });

  describe('GET /:requestId', () => {
    it('should call requestsService.findOne and return a specific food request', async () => {
      const requestId = 1;

      mockRequestsService.findOne.mockResolvedValueOnce(
        foodRequest1 as FoodRequest,
      );

      const result = await controller.getRequest(requestId);

      expect(result).toEqual(foodRequest1);
      expect(mockRequestsService.findOne).toHaveBeenCalledWith(requestId);
    });
  });

  describe('GET /:requestId/order-details', () => {
    it('should call requestsService.getOrderDetails and return all associated orders and their details', async () => {
      const mockOrderDetails: OrderDetailsDto[] = [
        {
          orderId: 10,
          status: OrderStatus.DELIVERED,
          foodManufacturerName: 'Test Manufacturer',
          trackingLink: 'examplelink.com',
          shippingCost: 8.0,
          items: [
            {
              id: 1,
              name: 'Rice',
              quantity: 5,
              foodType: FoodType.GRANOLA,
            },
            {
              id: 2,
              name: 'Beans',
              quantity: 3,
              foodType: FoodType.DRIED_BEANS,
            },
          ],
        },
        {
          orderId: 11,
          status: OrderStatus.PENDING,
          foodManufacturerName: 'Another Manufacturer',
          trackingLink: 'examplelink.com',
          shippingCost: 8.0,
          items: [
            {
              id: 1,
              name: 'Milk',
              quantity: 2,
              foodType: FoodType.DAIRY_FREE_ALTERNATIVES,
            },
          ],
        },
      ];

      const requestId = 1;

      mockRequestsService.getOrderDetails.mockResolvedValueOnce(
        mockOrderDetails as OrderDetailsDto[],
      );

      const result = await controller.getAllOrderDetailsFromRequest(requestId);

      expect(result).toEqual(mockOrderDetails);
      expect(mockRequestsService.getOrderDetails).toHaveBeenCalledWith(
        requestId,
      );
    });
  });

  describe('POST /', () => {
    it('should call requestsService.create and return the created food request', async () => {
      const createBody: Partial<CreateRequestDto> = {
        pantryId: 1,
        requestedSize: RequestSize.MEDIUM,
        requestedFoodTypes: [
          FoodType.DAIRY_FREE_ALTERNATIVES,
          FoodType.DRIED_BEANS,
        ],
        additionalInformation: 'Test information.',
      };

      const createdRequest: Partial<FoodRequest> = {
        requestId: 1,
        ...createBody,
        requestedAt: new Date(),
        orders: null,
      };

      mockRequestsService.create.mockResolvedValueOnce(
        createdRequest as FoodRequest,
      );

      const result = await controller.createRequest(
        createBody as CreateRequestDto,
      );

      expect(result).toEqual(createdRequest);
      expect(mockRequestsService.create).toHaveBeenCalledWith(
        createBody.pantryId,
        createBody.requestedSize,
        createBody.requestedFoodTypes,
        createBody.additionalInformation,
      );
    });
  });

  describe('GET /:requestId/matching-manufacturers', () => {
    it('should call requestsService.getMatchingManufacturers and return grouped manufacturers', async () => {
      const requestId = 1;

      const mockResult: MatchingManufacturersDto = {
        matchingManufacturers: [
          {
            foodManufacturerId: 1,
            foodManufacturerName: 'Test Manufacturer 1',
          } as FoodManufacturer,
          {
            foodManufacturerId: 2,
            foodManufacturerName: 'Test Manufacturer 2',
          } as FoodManufacturer,
        ],
        nonMatchingManufacturers: [
          {
            foodManufacturerId: 3,
            foodManufacturerName: 'Non-Matching Manufacturer',
          } as FoodManufacturer,
        ],
      };
      mockRequestsService.getMatchingManufacturers.mockResolvedValueOnce(
        mockResult,
      );

      const result = await controller.getMatchingManufacturers(requestId);

      expect(result).toEqual(mockResult);
      expect(mockRequestsService.getMatchingManufacturers).toHaveBeenCalledWith(
        requestId,
      );
    });
  });

  describe('PATCH /:requestId', () => {
    it('should update request with valid information', async () => {
      const updatedRequest = {
        ...foodRequest1,
        requestedSize: RequestSize.MEDIUM,
      };
      mockRequestsService.update.mockResolvedValue(
        updatedRequest as FoodRequest,
      );

      const updateRequestDto: UpdateRequestDto = {
        requestedSize: RequestSize.MEDIUM,
      };
      const result = await controller.updateRequest(1, updateRequestDto);

      expect(result).toEqual(updatedRequest);
      expect(mockRequestsService.update).toHaveBeenCalledWith(
        1,
        updateRequestDto,
      );
    });
  });

  describe('DELETE /:requestId', () => {
    it('should delete a request by id', async () => {
      mockRequestsService.delete.mockResolvedValue(undefined);

      const result = await controller.deleteRequest(1);

      expect(result).toBeUndefined();
      expect(mockRequestsService.delete).toHaveBeenCalledWith(1);
    });
  });

  describe('GET /:requestId/matching-manufacturers/:foodManufacturerId/available-items', () => {
    it('should call requestsService.getAvailableItems and return grouped items', async () => {
      const requestId = 1;
      const foodManufacturerId = 1;

      const mockResult: MatchingItemsDto = {
        matchingItems: [
          {
            itemId: 1,
            itemName: 'Granola',
            foodType: FoodType.GRANOLA,
            availableQuantity: 10,
          } as DonationItemDetailsDto,
          {
            itemId: 2,
            itemName: 'Dried Beans',
            foodType: FoodType.DRIED_BEANS,
            availableQuantity: 5,
          } as DonationItemDetailsDto,
        ],
        nonMatchingItems: [
          {
            itemId: 3,
            itemName: 'Dairy Free Alternatives',
            foodType: FoodType.DAIRY_FREE_ALTERNATIVES,
            availableQuantity: 8,
          } as DonationItemDetailsDto,
        ],
      };
      mockRequestsService.getAvailableItems.mockResolvedValueOnce(mockResult);

      const result = await controller.getAvailableItemsForManufacturer(
        requestId,
        foodManufacturerId,
      );

      expect(result).toEqual(mockResult);
      expect(mockRequestsService.getAvailableItems).toHaveBeenCalledWith(
        requestId,
        foodManufacturerId,
      );
    });
  });

  describe('PATCH /:requestId/close', () => {
    it('should call requestsService.closeRequest and return the closed food request', async () => {
      const requestId = 1;
      const closedRequest: Partial<FoodRequest> = {
        ...foodRequest1,
        status: FoodRequestStatus.CLOSED,
      };

      mockRequestsService.closeRequest.mockResolvedValueOnce(
        closedRequest as FoodRequest,
      );

      const result = await controller.closeRequest(requestId);

      expect(result).toEqual(closedRequest);
      expect(mockRequestsService.closeRequest).toHaveBeenCalledWith(requestId);
    });
  });
});
