import { RequestsService } from './request.service';
import { RequestsController } from './request.controller';
import { Test, TestingModule } from '@nestjs/testing';
import { mock } from 'jest-mock-extended';
import { AWSS3Service } from '../aws/aws-s3.service';
import { OrdersService } from '../orders/order.service';
import { Readable } from 'stream';

const mockRequestsService = mock<RequestsService>();
const mockOrdersService = mock<OrdersService>();
const mockAWSS3Service = mock<AWSS3Service>();

describe('RequestsController', () => {
  let controller: RequestsController;

  beforeEach(async () => {
    mockRequestsService.findOne.mockReset();
    mockRequestsService.find.mockReset();
    mockRequestsService.create.mockReset();
    mockRequestsService.updateDeliveryDetails?.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RequestsController],
      providers: [
        {
          provide: RequestsService,
          useValue: mockRequestsService,
        },
        {
          provide: AWSS3Service,
          useValue: mockOrdersService,
        },
        {
          provide: OrdersService,
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
      const foodRequest = {
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

      mockRequestsService.findOne.mockResolvedValueOnce(foodRequest);

      const result = await controller.getRequest(requestId);

      expect(result).toEqual(foodRequest);
      expect(mockRequestsService.findOne).toHaveBeenCalledWith(requestId);
    });
  });

  describe('GET /get-all-requests/:pantryId', () => {
    it('should call requestsService.find and return all food requests for a specific pantry', async () => {
      const foodRequests = [
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

      mockRequestsService.find.mockResolvedValueOnce(foodRequests);

      const result = await controller.getAllPantryRequests(pantryId);

      expect(result).toEqual(foodRequests);
      expect(mockRequestsService.find).toHaveBeenCalledWith(pantryId);
    });
  });

  describe('POST /create', () => {
    it('should call requestsService.create and return the created food request', async () => {
      const createBody = {
        pantryId: 1,
        requestedSize: 'Medium (5-10 boxes)',
        requestedItems: ['Test item 1', 'Test item 2'],
        additionalInformation: 'Test information.',
        dateReceived: null,
        feedback: null,
        photos: null,
      };

      const createdRequest = {
        requestId: 1,
        ...createBody,
        requestedAt: new Date(),
        order: null,
      };

      mockRequestsService.create.mockResolvedValueOnce(createdRequest);

      const result = await controller.createRequest(createBody);

      expect(result).toEqual(createdRequest);
      expect(mockRequestsService.create).toHaveBeenCalledWith(
        createBody.pantryId,
        createBody.requestedSize,
        createBody.requestedItems,
        createBody.additionalInformation,
        createBody.dateReceived,
        createBody.feedback,
        createBody.photos,
      );
    });
  });

  describe('POST /confirm-delivery', () => {
    it('should call awsService.upload and then call orderService.updateDeliveryDetails and then call requestsService.updateDeliveryDetails and return the updated food request', async () => {
      const requestId = 1;
      const updateBody = {
        deliveryDate: new Date(),
        feedback: 'Delivery was on time.',
      };

      const mockStream = new Readable();
      mockStream._read = () => {};

      const photos: Express.Multer.File[] = [
        {
          fieldname: 'photos',
          originalname: 'photo1.jpg',
          encoding: '7bit',
          mimetype: 'image/jpeg',
          buffer: Buffer.from('fake image content 1'),
          size: 1234,
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
          buffer: Buffer.from('fake image content 2'),
          size: 5678,
          destination: '',
          filename: '',
          path: '',
          stream: mockStream,
        },
      ];

      const updatedPhotoUrls = [
        'https://s3.amazonaws.com/bucket/photo1.jpg',
        'https://s3.amazonaws.com/bucket/photo2.jpg',
      ];
      mockAWSS3Service.upload.mockResolvedValueOnce(updatedPhotoUrls);

      const photoResult = await mockAWSS3Service.upload(photos);
      expect(photoResult).toEqual(updatedPhotoUrls);
      expect(mockAWSS3Service.upload).toHaveBeenCalledWith(photos);

      await mockOrdersService.updateStatus(requestId, 'deivered');
      expect(mockOrdersService.updateStatus).toHaveBeenCalledWith(
        requestId,
        'deivered',
      );

      // Mock the RequestsService.updateDeliveryDetails method
      const updatedRequest = {
        requestId,
        pantryId: 1,
        requestedSize: 'Medium (5-10 boxes)',
        requestedItems: ['Canned Goods', 'Vegetables'],
        additionalInformation: 'No onions, please.',
        requestedAt: new Date(),
        dateReceived: updateBody.deliveryDate,
        feedback: updateBody.feedback,
        photos: updatedPhotoUrls,
        order: null,
      };

      mockRequestsService.updateDeliveryDetails.mockResolvedValueOnce(
        updatedRequest,
      );

      const requestResult = await mockRequestsService.updateDeliveryDetails(
        requestId,
        updateBody.deliveryDate,
        updateBody.feedback,
        updatedPhotoUrls,
      );

      expect(requestResult).toEqual(updatedRequest);
      expect(mockRequestsService.updateDeliveryDetails).toHaveBeenCalledWith(
        requestId,
        updateBody.deliveryDate,
        updateBody.feedback,
        updatedPhotoUrls,
      );
    });

    it('should throw an error if the received date is not properly formatted', async () => {
      const requestId = 1;
      const updateBody = {
        dateReceived: 'invalid-date',
        feedback: 'Delivery was on time.',
      };

      await expect(
        controller.confirmDelivery(requestId, updateBody, []),
      ).rejects.toThrow();
    });
  });
});
