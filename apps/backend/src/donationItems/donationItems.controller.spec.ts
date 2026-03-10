import { Test, TestingModule } from '@nestjs/testing';
import { DonationItemsController } from './donationItems.controller';
import { DonationItemsService } from './donationItems.service';
import { DonationItem } from './donationItems.entity';
import { mock } from 'jest-mock-extended';
import { FoodType } from './types';
import { CreateMultipleDonationItemsDto } from './dtos/create-donation-items.dto';
import { Donation } from '../donations/donations.entity';
import { DonationStatus } from '../donations/types';

const mockDonationItemsService = mock<DonationItemsService>();

describe('DonationItemsController', () => {
  let controller: DonationItemsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DonationItemsController],
      providers: [
        { provide: DonationItemsService, useValue: mockDonationItemsService },
      ],
    }).compile();

    controller = module.get<DonationItemsController>(DonationItemsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createMultipleDonationItems', () => {
    it('should call donationItemsService.createMultipleDonationItems with donationId and items, and return the created donation items', async () => {
      const mockBody: CreateMultipleDonationItemsDto = {
        donationId: 1,
        items: [
          {
            itemName: 'Rice Noodles',
            quantity: 100,
            reservedQuantity: 0,
            ozPerItem: 5,
            estimatedValue: 100,
            foodType: FoodType.DAIRY_FREE_ALTERNATIVES,
          },
          {
            itemName: 'Beans',
            quantity: 50,
            reservedQuantity: 0,
            ozPerItem: 10,
            estimatedValue: 80,
            foodType: FoodType.GLUTEN_FREE_BAKING_PANCAKE_MIXES,
          },
        ],
      };

      const mockCreatedItems: Partial<DonationItem>[] = [
        { itemId: 1, donationId: 1, ...mockBody.items[0] },
        { itemId: 2, donationId: 1, ...mockBody.items[1] },
      ];

      mockDonationItemsService.createMultipleDonationItems.mockResolvedValue(
        mockCreatedItems as DonationItem[],
      );

      const result = await controller.createMultipleDonationItems(mockBody);

      expect(
        mockDonationItemsService.createMultipleDonationItems,
      ).toHaveBeenCalledWith(mockBody.donationId, mockBody.items);
      expect(result).toEqual(mockCreatedItems);
    });
  });

  describe('getDonationsFromDonationItemIds', () => {
    it('should call service.getAssociatedDonations with donationItemIds and return donations', async () => {
      const donationItemIds = [1, 2, 3];
      const mockDonations = [
        { donationId: 1, status: DonationStatus.AVAILABLE },
        { donationId: 2, status: DonationStatus.FULFILLED },
      ] as Partial<Donation>[];

      mockDonationItemsService.getAssociatedDonations.mockResolvedValue(
        mockDonations as Donation[],
      );

      const result = await controller.getDonationsFromDonationItemIds(
        donationItemIds,
      );

      expect(
        mockDonationItemsService.getAssociatedDonations,
      ).toHaveBeenCalledWith(donationItemIds);
      expect(result).toEqual(mockDonations);
    });
  });

  describe('getAllDonationItems', () => {
    it('should call service.getAll with donationItemIds and return donation items', async () => {
      const donationItemIds = [1, 2];
      const mockItems = [
        { itemId: 1, itemName: 'Rice' },
        { itemId: 2, itemName: 'Beans' },
      ] as Partial<DonationItem>[];

      mockDonationItemsService.getAll.mockResolvedValue(
        mockItems as DonationItem[],
      );

      const result = await controller.getAllDonationItems(donationItemIds);

      expect(mockDonationItemsService.getAll).toHaveBeenCalledWith(
        donationItemIds,
      );
      expect(result).toEqual(mockItems);
    });
  });

  describe('setDonationItemQuantities', () => {
    it('should call service.setDonationItemQuantities with the body', async () => {
      const body: Record<number, number> = { 1: 10, 2: 20 };

      mockDonationItemsService.setDonationItemQuantities.mockResolvedValue(
        undefined,
      );

      const result = await controller.setDonationItemQuantities(body);

      expect(
        mockDonationItemsService.setDonationItemQuantities,
      ).toHaveBeenCalledWith(body);
      expect(result).toBeUndefined();
    });
  });
});
