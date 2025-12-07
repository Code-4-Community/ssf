import { Test, TestingModule } from '@nestjs/testing';
import { DonationItemsController } from './donationItems.controller';
import { DonationItemsService } from './donationItems.service';
import { DonationItem } from './donationItems.entity';
import { mock } from 'jest-mock-extended';
import { FoodType } from './types';
import { CreateMultipleDonationItemsDto } from './dtos/create-donation-items.dto';

const mockDonationItemsService = mock<DonationItemsService>();

describe('DonationItemsController', () => {
  let controller: DonationItemsController;

  const mockDonationItemsCreateData: Partial<DonationItem>[] = [
    {
      itemId: 1,
      donationId: 1,
      itemName: 'Canned Beans',
      quantity: 100,
      reservedQuantity: 0,
      status: 'available',
      ozPerItem: 15,
      estimatedValue: 200,
      foodType: FoodType.DAIRY_FREE_ALTERNATIVES,
    },
    {
      itemId: 2,
      donationId: 1,
      itemName: 'Rice',
      quantity: 50,
      reservedQuantity: 0,
      status: 'available',
      ozPerItem: 20,
      estimatedValue: 150,
      foodType: FoodType.GLUTEN_FREE_BAKING_PANCAKE_MIXES,
    },
  ];

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

  describe('create', () => {
    it('should call donationItemsService.create and return a donationItem', async () => {
      const donationItemData = mockDonationItemsCreateData[0];
      mockDonationItemsService.create.mockResolvedValue(
        donationItemData as DonationItem,
      );
      const result = await controller.createDonationItem(
        donationItemData as DonationItem,
      );
      expect(result).toEqual(donationItemData as DonationItem);
      expect(mockDonationItemsService.create).toHaveBeenCalledWith(
        donationItemData.donationId,
        donationItemData.itemName,
        donationItemData.quantity,
        donationItemData.reservedQuantity,
        donationItemData.status,
        donationItemData.ozPerItem,
        donationItemData.estimatedValue,
        donationItemData.foodType,
      );
    });
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
            status: 'available',
            ozPerItem: 5,
            estimatedValue: 100,
            foodType: FoodType.DAIRY_FREE_ALTERNATIVES,
          },
          {
            itemName: 'Beans',
            quantity: 50,
            reservedQuantity: 0,
            status: 'available',
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
});
