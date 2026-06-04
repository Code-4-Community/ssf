import { DonationService } from './donations.service';
import { DonationsController } from './donations.controller';
import { Test, TestingModule } from '@nestjs/testing';
import { mock } from 'jest-mock-extended';
import { Donation } from './donations.entity';
import { CreateDonationDto } from './dtos/create-donation.dto';
import { CreateDonationItemDto } from '../donationItems/dtos/create-donation-items.dto';
import { DonationStatus, RecurrenceEnum } from './types';
import { UpdateDonationItemDetailsDto } from '../donationItems/dtos/update-donation-item-details.dto';

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

  describe('POST /', () => {
    it('should call donationService.create and return the created donation', async () => {
      const createBody: Partial<CreateDonationDto> = {
        foodManufacturerId: 1,
        recurrence: RecurrenceEnum.MONTHLY,
        recurrenceFreq: 3,
        occurrencesRemaining: 2,
        items: [
          {
            itemName: 'Item 1',
          } as CreateDonationItemDto,
          {
            itemName: 'Item 2',
          } as CreateDonationItemDto,
        ] as CreateDonationItemDto[],
      };

      const createdDonation: Partial<Donation> = {
        donationId: 1,
        ...createBody,
        dateDonated: new Date(),
        status: DonationStatus.AVAILABLE,
      };

      mockDonationService.create.mockResolvedValueOnce(
        createdDonation as Donation,
      );

      const result = await controller.createDonation(
        createBody as CreateDonationDto,
      );

      expect(result).toEqual(createdDonation);
      expect(mockDonationService.create).toHaveBeenCalledWith(createBody);
    });
  });

  describe('PATCH /:donationId/item-details', () => {
    it('calls updateDonationItemDetails with the correct donationId and body, returns result', async () => {
      const donationId = 1;
      const body: UpdateDonationItemDetailsDto[] = [
        {
          itemId: 1,
          ozPerItem: 5.0,
          estimatedValue: 10.0,
          foodRescue: true,
        },
        {
          itemId: 2,
          ozPerItem: 8.0,
          estimatedValue: 15.0,
          foodRescue: false,
        },
      ];

      await controller.updateDonationItemDetails(donationId, body);

      expect(
        mockDonationService.updateDonationItemDetails,
      ).toHaveBeenCalledWith(donationId, body);
    });
  });

  describe('DELETE /:donationId', () => {
    it('should call donationService.delete with the correct id', async () => {
      const donationId = 1;

      await controller.deleteDonation(donationId);

      expect(mockDonationService.delete).toHaveBeenCalledWith(donationId);
      expect(mockDonationService.delete).toHaveBeenCalledTimes(1);
    });
  });
});
