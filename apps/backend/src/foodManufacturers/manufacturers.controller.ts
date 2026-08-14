import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  ValidationPipe,
} from '@nestjs/common';
import { FoodManufacturersService } from './manufacturers.service';
import { FoodManufacturer } from './manufacturers.entity';
import { FoodManufacturerApplicationDto } from './dtos/manufacturer-application.dto';
import { ApiBody } from '@nestjs/swagger';
import { Allergen, DonateWastedFood } from './types';
import { Public } from '../auth/public.decorator';
import { UpdateFoodManufacturerApplicationDto } from './dtos/update-manufacturer-application.dto';
import { ManufacturerSummaryDto } from './dtos/manufacturer-summary.dto';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../users/types';
import { AuthenticatedRequest } from '../auth/authenticated-request';
import {
  DonationDetailsDto,
  DonationReminderDto,
} from './dtos/donation-details-dto';
import {
  CheckOwnership,
  OwnerIdResolver,
  pipeNullable,
} from '../auth/ownership.decorator';

const resolveFoodManufacturerAuthorizedUserIds: OwnerIdResolver = ({
  entityId,
  services,
}) =>
  pipeNullable(
    () => services.get(FoodManufacturersService).findOne(entityId),
    (manufacturer: FoodManufacturer) => [
      manufacturer.foodManufacturerRepresentative.id,
    ],
  );

@Controller('manufacturers')
export class FoodManufacturersController {
  constructor(private foodManufacturersService: FoodManufacturersService) {}

  @Roles(Role.ADMIN)
  @Get('/pending')
  async getPendingManufacturers(): Promise<FoodManufacturer[]> {
    return this.foodManufacturersService.getPendingManufacturers();
  }

  @Roles(Role.ADMIN)
  @Get('/approved')
  async getApprovedManufacturers(): Promise<FoodManufacturer[]> {
    return this.foodManufacturersService.getApprovedManufacturers();
  }

  @Roles(Role.FOODMANUFACTURER)
  @Get('/my-id')
  async getCurrentUserFoodManufacturerId(
    @Req() req: AuthenticatedRequest,
  ): Promise<number> {
    const approved =
      await this.foodManufacturersService.findApprovedManufacturersByUserId(
        req.user.id,
      );

    if (approved.length === 0) {
      throw new NotFoundException(
        `No approved food manufacturer found for user ${req.user.id}`,
      );
    }

    return approved[0].foodManufacturerId;
  }

  @Roles(Role.FOODMANUFACTURER)
  @Get('/me')
  async getCurrentUserFoodManufacturers(
    @Req() req: AuthenticatedRequest,
  ): Promise<ManufacturerSummaryDto[]> {
    const manufacturers =
      await this.foodManufacturersService.findApprovedManufacturersByUserId(
        req.user.id,
      );

    return manufacturers.map((m) => ({
      foodManufacturerId: m.foodManufacturerId,
      foodManufacturerName: m.foodManufacturerName,
    }));
  }

  @Roles(Role.ADMIN, Role.FOODMANUFACTURER)
  @CheckOwnership({
    idParam: 'foodManufacturerId',
    resolver: resolveFoodManufacturerAuthorizedUserIds,
  })
  @Get('/:foodManufacturerId')
  async getFoodManufacturer(
    @Param('foodManufacturerId', ParseIntPipe) foodManufacturerId: number,
  ): Promise<FoodManufacturer> {
    return this.foodManufacturersService.findOne(foodManufacturerId);
  }

  @Roles(Role.FOODMANUFACTURER)
  @Get('/me/donations')
  async getFoodManufacturerDonations(
    @Req() req: AuthenticatedRequest,
  ): Promise<DonationDetailsDto[]> {
    return this.foodManufacturersService.getDonationsForRepresentative(
      req.user.id,
    );
  }

  @Roles(Role.FOODMANUFACTURER)
  @Get('/me/next-two-reminders')
  async getNextTwoDonationReminders(
    @Req() req: AuthenticatedRequest,
  ): Promise<DonationReminderDto[]> {
    return this.foodManufacturersService.getUpcomingRemindersForRepresentative(
      req.user.id,
    );
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
          description: 'Phone must be a valid US phone number',
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
          description: 'Phone must be a valid US phone number',
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
        additionalComments: {
          type: 'string',
          example: 'Nope!',
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
        'productsSustainableExplanation',
        'inKindDonations',
        'donateWastedFood',
      ],
    },
  })
  @Public()
  @Post('/application')
  async submitFoodManufacturerApplication(
    @Body(new ValidationPipe())
    foodManufacturerData: FoodManufacturerApplicationDto,
  ): Promise<void> {
    return this.foodManufacturersService.addFoodManufacturer(
      foodManufacturerData,
    );
  }

  @Roles(Role.FOODMANUFACTURER, Role.ADMIN)
  @CheckOwnership({
    idParam: 'foodManufacturerId',
    resolver: resolveFoodManufacturerAuthorizedUserIds,
  })
  @Patch('/:foodManufacturerId/application')
  async updateFoodManufacturerApplication(
    @Req() req: AuthenticatedRequest,
    @Param('foodManufacturerId', ParseIntPipe) foodManufacturerId: number,
    @Body(new ValidationPipe())
    foodManufacturerData: UpdateFoodManufacturerApplicationDto,
  ): Promise<FoodManufacturer> {
    return this.foodManufacturersService.updateFoodManufacturerApplication(
      foodManufacturerId,
      foodManufacturerData,
      req.user.id,
      req.user.role,
    );
  }

  @Roles(Role.ADMIN)
  @Patch('/:foodManufacturerId/approve')
  async approveManufacturer(
    @Param('foodManufacturerId', ParseIntPipe) foodManufacturerId: number,
  ): Promise<void> {
    return this.foodManufacturersService.approve(foodManufacturerId);
  }

  @Roles(Role.ADMIN)
  @Patch('/:foodManufacturerId/deny')
  async denyManufacturer(
    @Param('foodManufacturerId', ParseIntPipe) foodManufacturerId: number,
  ): Promise<void> {
    return this.foodManufacturersService.deny(foodManufacturerId);
  }
}
