import { DonationService } from './donations.service';
import { DonationsController } from './donations.controller';
import { Test, TestingModule } from '@nestjs/testing';
import { mock } from 'jest-mock-extended';
import { Donation } from './donations.entity';
import { FoodManufacturer } from '../foodManufacturers/manufacturers.entity';

const mockDonationService = mock<DonationService>();

describe('DonationsController', () => {
  let controller: DonationsController;

  beforeEach(async () => {
    mockDonationService.getNumberOfDonations.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DonationsController],
      providers: [
        {
          provide: DonationService,
          useValue: mockDonationService,
        },
      ],
    }).compile();

    controller = module.get<DonationsController>(DonationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /count', () => {
    it.each([[0], [5]])('should return %i donations', async (count) => {
      mockDonationService.getNumberOfDonations.mockResolvedValue(count);

      const result = await controller.getNumberOfDonations();

      expect(result).toBe(count);
      expect(mockDonationService.getNumberOfDonations).toHaveBeenCalled();
    });
  });

  describe('GET /:donationId', () => {
    it('should return a donation for a given donation ID', async () => {
      const mockDonations: Partial<Donation>[] = [
        { donationId: 1 },
        { donationId: 2 },
      ];
      mockDonationService.findOne.mockResolvedValue(
        mockDonations[0] as Donation,
      );

      const result = await controller.getDonation(1);

      expect(result).toBe(mockDonations[0]);
      expect(mockDonationService.findOne).toHaveBeenCalledWith(1);
    });
  });
});
