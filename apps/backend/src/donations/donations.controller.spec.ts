import { DonationService } from './donations.service';
import { DonationsController } from './donations.controller';
import { Test, TestingModule } from '@nestjs/testing';
import { mock } from 'jest-mock-extended';
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
});
