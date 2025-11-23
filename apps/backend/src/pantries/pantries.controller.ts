import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { Pantry } from './pantries.entity';
import { PantriesService } from './pantries.service';
import { PantryApplicationDto } from './dtos/pantry-application.dto';
import { ApiBody } from '@nestjs/swagger';

@Controller('pantries')
export class PantriesController {
  constructor(private pantriesService: PantriesService) {}

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
          enum: ['Yes', 'Small quantities only', 'No'],
          example: 'Yes',
        },
        reserveFoodForAllergic: {
          type: 'string',
          enum: ['Yes', 'Some', 'No'],
          example: 'Some',
        },
        reservationExplanation: {
          type: 'string',
          example:
            'We keep a dedicated section for clients with severe allergies',
        },
        dedicatedAllergyFriendly: {
          type: 'string',
          enum: [
            'Yes, we have a dedicated shelf or box',
            'Yes, we keep allergy-friendly items in a back room',
            'No, we keep allergy-friendly items throughout the pantry, depending on the type of item',
          ],
          example: 'Yes, we have a dedicated shelf or box',
        },
        clientVisitFrequency: {
          type: 'string',
          enum: [
            'Daily',
            'More than once a week',
            'Once a week',
            'A few times a month',
            'Once a month',
          ],
          example: 'Once a week',
        },
        identifyAllergensConfidence: {
          type: 'string',
          enum: [
            'Very confident',
            'Somewhat confident',
            'Not very confident (we need more education!)',
          ],
          example: 'Very confident',
        },
        serveAllergicChildren: {
          type: 'string',
          enum: ['Yes, many (> 10)', 'Yes, a few (< 10)', 'No'],
          example: 'Yes, a few (< 10)',
        },
        activities: {
          type: 'array',
          items: {
            type: 'string',
            enum: [
              'Create a labeled, allergy-friendly shelf or shelves',
              'Provide clients and staff/volunteers with educational pamphlets',
              "Use a spreadsheet to track clients' medical dietary needs and distribution of SSF items per month",
              'Post allergen-free resource flyers throughout pantry',
              'Survey your clients to determine their medical dietary needs',
              'Collect feedback from allergen-avoidant clients on SSF foods',
              'Something else',
            ],
          },
          example: [
            'Create a labeled, allergy-friendly shelf or shelves',
            'Provide clients and staff/volunteers with educational pamphlets',
          ],
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
    @Body() pantryData: PantryApplicationDto,
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
