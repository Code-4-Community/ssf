import { RequestsService } from './request.service';
import { RequestsController } from './request.controller';
import { Test, TestingModule } from '@nestjs/testing';
import { mock } from 'jest-mock-extended';
import { FoodRequest } from './request.entity';
import { RequestSize } from './types';
import { OrderStatus } from '../orders/types';
import { FoodType } from '../donationItems/types';
import { OrderDetailsDto } from './dtos/order-details.dto';
import { CreateRequestDto } from './dtos/create-request.dto';
import { Order } from '../orders/order.entity';

const mockRequestsService = mock<RequestsService>();

const foodRequest: Partial<FoodRequest> = {
  requestId: 1,
  pantryId: 1,
};

describe('RequestsController', () => {
  let controller: RequestsController;

  beforeEach(async () => {
    mockRequestsService.findOne.mockReset();
    mockRequestsService.find.mockReset();
    mockRequestsService.create.mockReset();
    mockRequestsService.getOrderDetails.mockReset();

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

  describe('GET /:requestId', () => {
    it('should call requestsService.findOne and return a specific food request', async () => {
      const requestId = 1;

      mockRequestsService.findOne.mockResolvedValueOnce(
        foodRequest as FoodRequest,
      );

      const result = await controller.getRequest(requestId);

      expect(result).toEqual(foodRequest);
      expect(mockRequestsService.findOne).toHaveBeenCalledWith(requestId);
    });
  });

  describe('GET /get-all-requests/:pantryId', () => {
    it('should call requestsService.find and return all food requests for a specific pantry', async () => {
      const foodRequests: Partial<FoodRequest>[] = [
        foodRequest,
        {
          requestId: 2,
          pantryId: 1,
        },
      ];
      const pantryId = 1;

      mockRequestsService.find.mockResolvedValueOnce(
        foodRequests as FoodRequest[],
      );

      const result = await controller.getAllPantryRequests(pantryId);

      expect(result).toEqual(foodRequests);
      expect(mockRequestsService.find).toHaveBeenCalledWith(pantryId);
    });
  });

  describe('GET /all-order-details/:requestId', () => {
    it('should call requestsService.getOrderDetails and return all associated orders and their details', async () => {
      const mockOrderDetails: OrderDetailsDto[] = [
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
          status: OrderStatus.PENDING,
          foodManufacturerName: 'Another Manufacturer',
          items: [
            {
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

  describe('POST /create', () => {
    it('should call requestsService.create and return the created food request', async () => {
      const createBody: Partial<CreateRequestDto> = {
        pantryId: 1,
        requestedSize: RequestSize.MEDIUM,
        requestedItems: [
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
        createBody.requestedItems,
        createBody.additionalInformation,
      );
    });
  });
});
