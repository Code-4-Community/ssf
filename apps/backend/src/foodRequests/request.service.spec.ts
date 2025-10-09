import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { FoodRequest } from './request.entity';
import { RequestsService } from './request.service';
import { mock } from 'jest-mock-extended';

const mockRequestsRepository = mock<Repository<FoodRequest>>();

describe('OrdersService', () => {
  let service: RequestsService;

  beforeAll(async () => {
    // Reset the mock repository before compiling module
    mockRequestsRepository.findOne.mockReset();

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
});
