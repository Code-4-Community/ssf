import { RequestsService } from './request.service';
import { RequestsController } from './request.controller';
import { Test, TestingModule } from '@nestjs/testing';
import { mock } from 'jest-mock-extended';
import { AWSS3Service } from '../aws/aws-s3.service';
import { OrdersService } from '../orders/order.service';
import { Readable } from 'stream';
import { FoodRequest } from './request.entity';
import { RequestSize } from './types';
import { OrderStatus } from '../orders/types';
import { FoodType } from '../donationItems/types';
import { OrderDetailsDto } from './dtos/order-details.dto';
import { Order } from '../orders/order.entity';
import {
  DonationItemDetailsDto,
  MatchingItemsDto,
  MatchingManufacturersDto,
} from './dtos/matching.dto';
import { FoodManufacturer } from '../foodManufacturers/manufacturers.entity';

const mockRequestsService = mock<RequestsService>();
const mockOrdersService = mock<OrdersService>();
const mockAWSS3Service = mock<AWSS3Service>();

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
    mockRequestsService.updateDeliveryDetails?.mockReset();
    mockRequestsService.getOrderDetails.mockReset();
    mockAWSS3Service.upload.mockReset();
    mockOrdersService.updateStatus.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RequestsController],
      providers: [
        {
          provide: RequestsService,
          useValue: mockRequestsService,
        },
        {
          provide: OrdersService,
          useValue: mockOrdersService,
        },
        {
          provide: AWSS3Service,
          useValue: mockAWSS3Service,
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
      const createBody: Partial<FoodRequest> = {
        pantryId: 1,
        requestedSize: RequestSize.MEDIUM,
        requestedFoodTypes: [
          FoodType.DAIRY_FREE_ALTERNATIVES,
          FoodType.DRIED_BEANS,
        ],
        additionalInformation: 'Test information.',
        dateReceived: null,
        feedback: null,
        photos: null,
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

      const result = await controller.createRequest(createBody as FoodRequest);

      expect(result).toEqual(createdRequest);
      expect(mockRequestsService.create).toHaveBeenCalledWith(
        createBody.pantryId,
        createBody.requestedSize,
        createBody.requestedFoodTypes,
        createBody.additionalInformation,
        createBody.dateReceived,
        createBody.feedback,
        createBody.photos,
      );
    });
  });

  describe('POST /:requestId/confirm-delivery', () => {
    it('should upload photos, update the order, then update the request', async () => {
      const requestId = 1;

      const body = {
        dateReceived: new Date().toISOString(),
        feedback: 'Nice delivery!',
      };

      // Mock Photos
      const mockStream = {} as Readable;

      const photos: Express.Multer.File[] = [
        {
          fieldname: 'photos',
          originalname: 'photo1.jpg',
          encoding: '7bit',
          mimetype: 'image/jpeg',
          buffer: Buffer.from('image1'),
          size: 1000,
          destination: '',
          filename: '',
          path: '',
          stream: mockStream,
        },
        {
          fieldname: 'photos',
          originalname: 'photo2.jpg',
          encoding: '7bit',
          mimetype: 'image/jpeg',
          buffer: Buffer.from('image2'),
          size: 2000,
          destination: '',
          filename: '',
          path: '',
          stream: mockStream,
        },
      ];

      const uploadedUrls = [
        'https://fake-s3/photo1.jpg',
        'https://fake-s3/photo2.jpg',
      ];

      // Mock AWS upload
      mockAWSS3Service.upload.mockResolvedValue(uploadedUrls);

      // Mock RequestsService.findOne
      mockRequestsService.findOne.mockResolvedValue({
        requestId,
        pantryId: 1,
        orders: [{ orderId: 99 }],
      } as FoodRequest);

      mockOrdersService.updateStatus.mockResolvedValue();

      const order = new Order();
      order.orderId = 99;

      const updatedRequest: Partial<FoodRequest> = {
        requestId,
        pantryId: 1,
        dateReceived: new Date(body.dateReceived),
        feedback: body.feedback,
        photos: uploadedUrls,
        orders: [order],
      };

      mockRequestsService.updateDeliveryDetails.mockResolvedValue(
        updatedRequest as FoodRequest,
      );

      const result = await controller.confirmDelivery(requestId, body, photos);

      expect(mockAWSS3Service.upload).toHaveBeenCalledWith(photos);

      expect(mockOrdersService.updateStatus).toHaveBeenCalledWith(
        99,
        OrderStatus.DELIVERED,
      );

      expect(mockRequestsService.updateDeliveryDetails).toHaveBeenCalledWith(
        requestId,
        new Date(body.dateReceived),
        body.feedback,
        uploadedUrls,
      );

      expect(result).toEqual(updatedRequest);
    });

    it('should handle no photos being uploaded', async () => {
      const requestId = 1;

      const body = {
        dateReceived: new Date().toISOString(),
        feedback: 'No photos delivery!',
      };

      mockRequestsService.findOne.mockResolvedValue({
        requestId,
        pantryId: 1,
        orders: [{ orderId: 100 }],
      } as FoodRequest);

      mockOrdersService.updateStatus.mockResolvedValue();

      const order = new Order();
      order.orderId = 100;

      const updatedRequest: Partial<FoodRequest> = {
        requestId,
        pantryId: 1,
        dateReceived: new Date(body.dateReceived),
        feedback: body.feedback,
        photos: [],
        orders: [order],
      };

      mockRequestsService.updateDeliveryDetails.mockResolvedValue(
        updatedRequest as FoodRequest,
      );

      const result = await controller.confirmDelivery(requestId, body);

      expect(mockAWSS3Service.upload).not.toHaveBeenCalled();
      expect(mockOrdersService.updateStatus).toHaveBeenCalledWith(
        100,
        OrderStatus.DELIVERED,
      );
      expect(mockRequestsService.updateDeliveryDetails).toHaveBeenCalledWith(
        requestId,
        new Date(body.dateReceived),
        body.feedback,
        [],
      );
      expect(result).toEqual(updatedRequest);
    });

    it('should handle empty photos array', async () => {
      const requestId = 1;

      const body = {
        dateReceived: new Date().toISOString(),
        feedback: 'Empty photos array delivery!',
      };

      mockRequestsService.findOne.mockResolvedValue({
        requestId,
        pantryId: 1,
        orders: [{ orderId: 101 }],
      } as FoodRequest);

      mockOrdersService.updateStatus.mockResolvedValue();

      const order = new Order();
      order.orderId = 101;

      const updatedRequest: Partial<FoodRequest> = {
        requestId,
        pantryId: 1,
        dateReceived: new Date(body.dateReceived),
        feedback: body.feedback,
        photos: [],
        orders: [order],
      };

      mockRequestsService.updateDeliveryDetails.mockResolvedValue(
        updatedRequest as FoodRequest,
      );

      const result = await controller.confirmDelivery(requestId, body, []);

      expect(mockAWSS3Service.upload).not.toHaveBeenCalled();
      expect(mockOrdersService.updateStatus).toHaveBeenCalledWith(
        101,
        OrderStatus.DELIVERED,
      );
      expect(mockRequestsService.updateDeliveryDetails).toHaveBeenCalledWith(
        requestId,
        new Date(body.dateReceived),
        body.feedback,
        [],
      );
      expect(result).toEqual(updatedRequest);
    });

    it('should throw an error for invalid date', async () => {
      await expect(
        controller.confirmDelivery(
          1,
          { dateReceived: 'bad-date', feedback: '' },
          [],
        ),
      ).rejects.toThrow('Invalid date format for deliveryDate');
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
});
