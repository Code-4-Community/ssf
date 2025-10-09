import { RequestsService } from './request.service';
import { RequestsController } from './request.controller';
import { Test, TestingModule } from '@nestjs/testing';
import { mock } from 'jest-mock-extended';
import { AWSS3Service } from '../aws/aws-s3.service';
import { OrdersService } from '../orders/order.service';

const mockRequestsService = mock<RequestsService>();
const mockOrdersService = mock<OrdersService>();
const mockAWSS3Service = mock<AWSS3Service>();

describe('RequestsController', () => {
  let controller: RequestsController;

  beforeEach(async () => {
    mockRequestsService.findOne.mockReset();

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

      // ✅ call with a number, since ParseIntPipe handles conversion in real controller
      const result = await controller.getRequest(requestId);

      expect(result).toEqual(foodRequest);
      expect(mockRequestsService.findOne).toHaveBeenCalledWith(requestId);
    });
  });
});
