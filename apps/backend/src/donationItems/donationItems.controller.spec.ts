import { Test, TestingModule } from '@nestjs/testing';
import { DonationItemsController } from './donationItems.controller';
import { DonationItemsService } from './donationItems.service';
import { DonationItem } from './donationItems.entity';
import { mock } from 'jest-mock-extended';

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
      foodType: 'legume',
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
      foodType: 'grain',
    }
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
      mockDonationItemsService.create.mockResolvedValue(donationItemData as DonationItem);
      const result = await controller.createDonationItem(donationItemData as DonationItem);
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
    it('should call donationItemsService.create for each item and return created donationItems', async () => {
      mockDonationItemsService.create.mockImplementation(async (donationId: number, itemName: string, quantity: number, reservedQuantity: number, status: string, ozPerItem: number, estimatedValue: number, foodType: string) => {
        return mockDonationItemsCreateData.find(
          (item) =>
            item.donationId === donationId &&
            item.itemName === itemName &&
            item.quantity === quantity &&
            item.reservedQuantity === reservedQuantity &&
            item.status === status &&
            item.ozPerItem === ozPerItem &&
            item.estimatedValue === estimatedValue &&
            item.foodType === foodType,
        ) as DonationItem;
      });
      const result = await controller.createMultipleDonationItems(mockDonationItemsCreateData as DonationItem[]);
      expect(result).toEqual(mockDonationItemsCreateData as DonationItem[]);
      for (const donationItemData of mockDonationItemsCreateData) {
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
      }
    });
  });
});