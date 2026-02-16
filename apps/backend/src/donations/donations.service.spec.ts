import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Donation } from './donations.entity';
import { DonationService } from './donations.service';
import { mock } from 'jest-mock-extended';
import { FoodManufacturer } from '../foodManufacturers/manufacturers.entity';
const mockDonationRepository = mock<Repository<Donation>>();
const mockFoodManufacturerRepository = mock<Repository<FoodManufacturer>>();
describe('DonationService', () => {
  let service: DonationService;
  beforeAll(async () => {
    mockDonationRepository.count.mockReset();
    const module = await Test.createTestingModule({
      providers: [
        DonationService,
        {
          provide: getRepositoryToken(Donation),
          useValue: mockDonationRepository,
        },
        {
          provide: getRepositoryToken(FoodManufacturer),
          useValue: mockFoodManufacturerRepository,
        },
      ],
    }).compile();
    service = module.get<DonationService>(DonationService);
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('getDonationCount', () => {
    it.each([[0], [5]])('should return %i of donations', async (count) => {
      mockDonationRepository.count.mockResolvedValue(count);
      const donationCount: number = await service.getNumberOfDonations();
      expect(donationCount).toEqual(count);
      expect(mockDonationRepository.count).toHaveBeenCalled();
    });
  });
});
