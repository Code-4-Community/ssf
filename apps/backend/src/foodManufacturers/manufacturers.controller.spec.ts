import { mock } from 'jest-mock-extended';
import { FoodManufacturersService } from './manufacturers.service';
import { FoodManufacturersController } from './manufacturers.controller';
import { Test, TestingModule } from '@nestjs/testing';
import { FoodManufacturer } from './manufacturers.entity';
import { Allergen, DonateWastedFood } from './types';
import { ApplicationStatus } from '../shared/types';
import { FoodManufacturerApplicationDto } from './dtos/manufacturer-application.dto';

const mockManufacturersService = mock<FoodManufacturersService>();

const mockManufacturer1: Partial<FoodManufacturer> = {
  foodManufacturerId: 1,
  foodManufacturerName: 'Good Foods Inc',
  status: ApplicationStatus.PENDING,
};

const mockManufacturer2: Partial<FoodManufacturer> = {
  foodManufacturerId: 2,
  foodManufacturerName: 'Healthy Eats LLC',
  status: ApplicationStatus.PENDING,
};

describe('FoodManufacturersController', () => {
  let controller: FoodManufacturersController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FoodManufacturersController],
      providers: [
        {
          provide: FoodManufacturersService,
          useValue: mockManufacturersService,
        },
      ],
    }).compile();

    controller = module.get<FoodManufacturersController>(
      FoodManufacturersController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /pending', () => {
    it('should return pending food manufacturers', async () => {
      const mockManufacturers: Partial<FoodManufacturer>[] = [
        mockManufacturer1,
        mockManufacturer2,
      ];

      mockManufacturersService.getPendingManufacturers.mockResolvedValue(
        mockManufacturers as FoodManufacturer[],
      );

      const result = await controller.getPendingManufacturers();

      expect(result).toEqual(mockManufacturers);
      expect(result).toHaveLength(2);
      expect(result[0].foodManufacturerId).toBe(1);
      expect(result[1].foodManufacturerId).toBe(2);
      expect(
        mockManufacturersService.getPendingManufacturers,
      ).toHaveBeenCalled();
    });
  });

  describe('GET /:id', () => {
    it('should return a food manufacturer by id', async () => {
      mockManufacturersService.findOne.mockResolvedValue(
        mockManufacturer1 as FoodManufacturer,
      );

      const result = await controller.getFoodManufacturer(1);

      expect(result).toEqual(mockManufacturer1);
      expect(mockManufacturersService.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('POST /application', () => {
    it('should submit a food manufacturer application', async () => {
      const mockApplicationData: FoodManufacturerApplicationDto = {
        foodManufacturerName: 'Good Foods Inc',
        foodManufacturerWebsite: 'https://goodfoods.example.com',
        contactFirstName: 'Alice',
        contactLastName: 'Johnson',
        contactEmail: 'alice.johnson@goodfoods.example.com',
        contactPhone: '555-123-4567',
        unlistedProductAllergens: [Allergen.EGG],
        facilityFreeAllergens: [Allergen.EGG],
        productsGlutenFree: true,
        productsContainSulfites: false,
        productsSustainableExplanation: 'We use eco-friendly packaging.',
        inKindDonations: true,
        donateWastedFood: DonateWastedFood.SOMETIMES,
      };

      mockManufacturersService.addFoodManufacturer.mockResolvedValue();

      await controller.submitFoodManufacturerApplication(mockApplicationData);

      expect(mockManufacturersService.addFoodManufacturer).toHaveBeenCalledWith(
        mockApplicationData,
      );
    });
  });

  describe('PATCH /:id/approve', () => {
    it('should approve a food manufacturer', async () => {
      mockManufacturersService.approve.mockResolvedValue();

      await controller.approveManufacturer(1);

      expect(mockManufacturersService.approve).toHaveBeenCalledWith(1);
    });
  });

  describe('PATCH /:id/deny', () => {
    it('should deny a food manufacturer', async () => {
      mockManufacturersService.deny.mockResolvedValue();

      await controller.denyManufacturer(1);

      expect(mockManufacturersService.deny).toHaveBeenCalledWith(1);
    });
  });
});
