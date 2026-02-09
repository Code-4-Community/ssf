import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  ValidationPipe,
} from '@nestjs/common';
import { FoodManufacturersService } from './manufacturers.service';
import { FoodManufacturer } from './manufacturers.entity';
import { FoodManufacturerApplicationDto } from './dtos/manufacturer-application.dto';
import { ApiBody } from '@nestjs/swagger';
import { Allergen, DonateWastedFood, ManufacturerAttribute } from './types';

@Controller('manufacturers')
export class FoodManufacturersController {
  constructor(private foodManufacturersService: FoodManufacturersService) {}

  @Get('/pending')
  async getPendingManufacturers(): Promise<FoodManufacturer[]> {
    return this.foodManufacturersService.getPendingManufacturers();
  }

  @Get('/:foodManufacturerId')
  async getFoodManufacturer(
    @Param('foodManufacturerId', ParseIntPipe) foodManufacturerId: number,
  ): Promise<FoodManufacturer> {
    return this.foodManufacturersService.findOne(foodManufacturerId);
  }

  @ApiBody({
    description: 'Details for submitting a manufacturer application',
    schema: {
      type: 'object',
      properties: {
        foodManufacturerName: {
          type: 'string',
          minLength: 1,
          maxLength: 255,
          example: 'Healthy Foods Co',
        },
        foodManufacturerWebsite: {
          type: 'string',
          minLength: 1,
          maxLength: 255,
          example: 'https://www.healthyfoodsco.com',
        },
        contactFirstName: {
          type: 'string',
          example: 'John',
        },
        contactLastName: {
          type: 'string',
          example: 'Smith',
        },
        contactEmail: {
          type: 'string',
          format: 'email',
          example: 'john.smith@example.com',
        },
        contactPhone: {
          type: 'string',
          format: 'phone',
          example: '(508) 508-6789',
          description: 'Must be a valid US phone number',
        },
        secondaryContactFirstName: {
          type: 'string',
          example: 'Jane',
        },
        secondaryContactLastName: {
          type: 'string',
          example: 'Smith',
        },
        secondaryContactEmail: {
          type: 'string',
          format: 'email',
          example: 'jane.smith@example.com',
        },
        secondaryContactPhone: {
          type: 'string',
          format: 'phone',
          example: '(508) 528-6789',
          description: 'Must be a valid US phone number',
        },
        unlistedProductAllergens: {
          type: 'array',
          enum: Object.values(Allergen),
          items: { type: 'string' },
          example: [Allergen.EGG, Allergen.PEANUT],
        },
        facilityFreeAllergens: {
          type: 'array',
          enum: Object.values(Allergen),
          items: { type: 'string' },
          example: [Allergen.PEANUT, Allergen.TREE_NUTS],
        },
        productsGlutenFree: {
          type: 'boolean',
          example: true,
        },
        productsContainSulfites: {
          type: 'boolean',
          example: false,
        },
        productsSustainableExplanation: {
          type: 'string',
          example: 'Our products are environmentally conscious.',
        },
        inKindDonations: {
          type: 'boolean',
          example: true,
        },
        donateWastedFood: {
          type: 'string',
          enum: Object.values(DonateWastedFood),
          example: DonateWastedFood.ALWAYS,
        },
        manufacturerAttribute: {
          type: 'string',
          enum: Object.values(ManufacturerAttribute),
          example: ManufacturerAttribute.ORGANIC,
        },
        additionalComments: {
          type: 'string',
          example: 'Nope!',
        },
        newsletterSubscription: {
          type: 'boolean',
          example: true,
        },
      },
      required: [
        'foodManufacturerName',
        'foodManufacturerWebsite',
        'contactFirstName',
        'contactLastName',
        'contactEmail',
        'contactPhone',
        'unlistedProductAllergens',
        'facilityFreeAllergens',
        'productsGlutenFree',
        'productsContainSulfites',
        'productsSustainableExplanation',
        'inKindDonations',
        'donateWastedFood',
      ],
    },
  })
  @Post('/submit-application')
  async submitFoodManufacturerApplication(
    @Body(new ValidationPipe())
    foodManufacturerData: FoodManufacturerApplicationDto,
  ): Promise<void> {
    return this.foodManufacturersService.addFoodManufacturer(
      foodManufacturerData,
    );
  }

  @Patch('/:manufacturerId/approve')
  async approveManufacturer(
    @Param('manufacturerId', ParseIntPipe) manufacturerId: number,
  ): Promise<void> {
    return this.foodManufacturersService.approve(manufacturerId);
  }

  @Patch('/:manufacturerId/deny')
  async denyManufacturer(
    @Param('manufacturerId', ParseIntPipe) manufacturerId: number,
  ): Promise<void> {
    return this.foodManufacturersService.deny(manufacturerId);
  }
}
