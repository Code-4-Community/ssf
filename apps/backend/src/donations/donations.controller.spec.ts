import { DonationService } from './donations.service';
import { DonationsController } from './donations.controller';
import { Test, TestingModule } from '@nestjs/testing';
import { mock } from 'jest-mock-extended';
import { Donation } from './donations.entity';
import { CreateDonationDto } from './dtos/create-donation.dto';
import { DonationStatus, RecurrenceEnum } from './types';

const mockDonationService = mock<DonationService>();

const donation1: Partial<Donation> = {
  donationId: 1,
  status: DonationStatus.MATCHED,
};

const donation2: Partial<Donation> = {
  donationId: 2,
  status: DonationStatus.FULFILLED,
};

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

  describe('GET /', () => {
    it('should call donationService.getAll and return array of donations', async () => {
      mockDonationService.getAll.mockResolvedValueOnce([
        donation1,
        donation2,
      ] as Donation[]);

      const result = await controller.getAllDonations();

      expect(result).toEqual([donation1, donation2]);
      expect(mockDonationService.getAll).toHaveBeenCalled();
    });
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
      const mockDonation: Partial<Donation> = { donationId: 1 };

      mockDonationService.findOne.mockResolvedValue(mockDonation as Donation);

      const result = await controller.getDonation(1);

      expect(result).toBe(mockDonation);
      expect(mockDonationService.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('POST /create', () => {
    it('should call requestsService.create and return the created food request', async () => {
      const createBody: Partial<CreateDonationDto> = {
        foodManufacturerId: 1,
        recurrence: RecurrenceEnum.MONTHLY,
        recurrenceFreq: 3,
        occurrencesRemaining: 2,
      };

      const createdRequest: Partial<Donation> = {
        donationId: 1,
        ...createBody,
        dateDonated: new Date(),
        status: DonationStatus.AVAILABLE,
      };

      mockDonationService.create.mockResolvedValueOnce(
        createdRequest as Donation,
      );

      const result = await controller.createDonation(
        createBody as CreateDonationDto,
      );

      expect(result).toEqual(createdRequest);
      expect(mockDonationService.create).toHaveBeenCalledWith(createBody);
    });
  });

  describe('PATCH /:donationId/fulfill', () => {
    it('should call donationService.fulfill and return updated donation', async () => {
      const donationId = 1;

      mockDonationService.fulfill.mockResolvedValueOnce(donation1 as Donation);

      const result = await controller.fulfillDonation(donationId);

      expect(result).toEqual(donation1);
      expect(mockDonationService.fulfill).toHaveBeenCalledWith(donationId);
    });
  });
});
