import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Donation } from './donations.entity';
import { DonationService } from './donations.service';

describe('DonationService', () => {
  let service: DonationService;
  let mockDonationRepository: { count: jest.Mock };

  beforeAll(async () => {
    // Creating a mock repository
    mockDonationRepository = {
      count: jest.fn(),
    };

    // Make the testing module and tell it to use the created mock repo
    const app = await Test.createTestingModule({
      providers: [
        DonationService,
        {
          provide: getRepositoryToken(Donation),
          useValue: mockDonationRepository,
        },
      ],
    }).compile();

    service = app.get<DonationService>(DonationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
