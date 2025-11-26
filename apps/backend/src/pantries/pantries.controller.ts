import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  ValidationPipe,
} from '@nestjs/common';
import { Pantry } from './pantries.entity';
import { PantriesService } from './pantries.service';
import { PantryApplicationDto } from './dtos/pantry-application.dto';
import { ApiBody } from '@nestjs/swagger';
import {
  Activity,
  AllergensConfidence,
  ClientVisitFrequency,
  RefrigeratedDonation,
  ReserveFoodForAllergic,
  ServeAllergicChildren,
} from './types';
import { Order } from '../orders/order.entity';
import { OrdersService } from '../orders/order.service';

@Controller('pantries')
export class PantriesController {
  constructor(
    private pantriesService: PantriesService,
    private ordersService: OrdersService,
  ) {}

  @Get('/pending')
  async getPendingPantries(): Promise<Pantry[]> {
    return this.pantriesService.getPendingPantries();
  }

  @Get('/:pantryId')
  async getPantry(
    @Param('pantryId', ParseIntPipe) pantryId: number,
  ): Promise<Pantry> {
    return this.pantriesService.findOne(pantryId);
  }

  @Get('/:pantryId/orders')
  async getOrders(
    @Param('pantryId', ParseIntPipe) pantryId: number,
  ): Promise<Order[]> {
    return this.ordersService.getOrdersByPantry(pantryId);
  }

  @ApiBody({
    description: 'Details for submitting a pantry application',
    schema: {
      type: 'object',
      properties: {
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
        pantryName: {
          type: 'string',
          minLength: 1,
          maxLength: 255,
          example: 'Community Food Pantry',
        },
        addressLine1: {
          type: 'string',
          minLength: 1,
          maxLength: 255,
          example: '123 Main Street',
        },
        addressLine2: {
          type: 'string',
          maxLength: 255,
          example: 'Suite 200',
        },
        addressCity: {
          type: 'string',
          minLength: 1,
          maxLength: 255,
          example: 'Boston',
        },
        addressState: {
          type: 'string',
          minLength: 1,
          maxLength: 255,
          example: 'MA',
        },
        addressZip: {
          type: 'string',
          minLength: 1,
          maxLength: 255,
          example: '02101',
        },
        addressCountry: {
          type: 'string',
          maxLength: 255,
          example: 'United States',
        },
        allergenClients: {
          type: 'string',
          minLength: 1,
          maxLength: 25,
          example: '10 to 20',
        },
        restrictions: {
          type: 'array',
          items: { type: 'string' },
          example: ['Egg allergy', 'Fish allergy'],
        },
        refrigeratedDonation: {
          type: 'string',
          enum: Object.values(RefrigeratedDonation),
          example: RefrigeratedDonation.YES,
        },
        reserveFoodForAllergic: {
          type: 'string',
          enum: Object.values(ReserveFoodForAllergic),
          example: ReserveFoodForAllergic.NO,
        },
        reservationExplanation: {
          type: 'string',
          example:
            'We keep a dedicated section for clients with severe allergies',
        },
        dedicatedAllergyFriendly: {
          type: 'boolean',
          example: true,
        },
        clientVisitFrequency: {
          type: 'string',
          enum: Object.values(ClientVisitFrequency),
          example: ClientVisitFrequency.DAILY,
        },
        identifyAllergensConfidence: {
          type: 'string',
          enum: Object.values(AllergensConfidence),
          example: AllergensConfidence.NOT_VERY_CONFIDENT,
        },
        serveAllergicChildren: {
          type: 'string',
          enum: Object.values(ServeAllergicChildren),
          example: ServeAllergicChildren.NO,
        },
        activities: {
          type: 'array',
          items: {
            type: 'string',
            enum: Object.values(Activity),
          },
          example: [Activity.COLLECT_FEEDBACK, Activity.CREATE_LABELED_SHELF],
        },
        activitiesComments: {
          type: 'string',
          example:
            'We would be willing to implement these activities over the next quarter',
        },
        itemsInStock: {
          type: 'string',
          example: 'Rice, pasta, canned vegetables, gluten-free bread',
        },
        needMoreOptions: {
          type: 'string',
          example: 'Quite often',
        },
        newsletterSubscription: {
          type: 'string',
          enum: ['Yes', 'No'],
          example: 'Yes',
        },
      },
      required: [
        'contactFirstName',
        'contactLastName',
        'contactEmail',
        'contactPhone',
        'pantryName',
        'addressLine1',
        'addressCity',
        'addressState',
        'addressZip',
        'allergenClients',
        'refrigeratedDonation',
        'reserveFoodForAllergic',
        'dedicatedAllergyFriendly',
        'activities',
        'itemsInStock',
        'needMoreOptions',
      ],
    },
  })
  
  @Post()
  async submitPantryApplication(
    @Body(new ValidationPipe())
    pantryData: PantryApplicationDto,
  ): Promise<void> {
    return this.pantriesService.addPantry(pantryData);
  }

  @Post('/approve/:pantryId')
  async approvePantry(
    @Param('pantryId', ParseIntPipe) pantryId: number,
  ): Promise<void> {
    return this.pantriesService.approve(pantryId);
  }

  @Post('/deny/:pantryId')
  async denyPantry(
    @Param('pantryId', ParseIntPipe) pantryId: number,
  ): Promise<void> {
    return this.pantriesService.deny(pantryId);
  }
}
