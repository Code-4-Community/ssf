import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { Pantry } from './pantries.entity';
import { PantriesService } from './pantries.service';
import { Role } from '../users/types';
import { Roles } from '../auth/roles.decorator';
import { ValidationPipe } from '@nestjs/common';
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
import { EmailsService } from '../emails/email.service';
import { SendEmailDTO } from '../emails/types';
import { Public } from '../auth/public.decorator';
import { AuthenticatedRequest } from '../auth/authenticated-request';

@Controller('pantries')
export class PantriesController {
  constructor(
    private pantriesService: PantriesService,
    private ordersService: OrdersService,
    private emailsService: EmailsService,
  ) {}

  @Roles(Role.PANTRY)
  @Get('/my-id')
  async getCurrentUserPantryId(
    @Req() req: AuthenticatedRequest,
  ): Promise<number> {
    const currentUser = req.user;

    const pantry = await this.pantriesService.findByUserId(currentUser.id);
    return pantry.pantryId;
  }

  @Roles(Role.ADMIN)
  @Get('/pending')
  async getPendingPantries(): Promise<Pantry[]> {
    return this.pantriesService.getPendingPantries();
  }

  @Roles(Role.PANTRY, Role.ADMIN)
  @Get('/:pantryId')
  async getPantry(
    @Param('pantryId', ParseIntPipe) pantryId: number,
  ): Promise<Pantry> {
    return this.pantriesService.findOne(pantryId);
  }

  @Roles(Role.ADMIN, Role.PANTRY)
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
        hasEmailContact: {
          type: 'boolean',
          example: true,
        },
        emailContactOther: {
          type: 'string',
          example: 'No we do not use email',
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
        pantryName: {
          type: 'string',
          minLength: 1,
          maxLength: 255,
          example: 'Community Food Pantry',
        },
        shipmentAddressLine1: {
          type: 'string',
          minLength: 1,
          maxLength: 255,
          example: '123 Main Street',
        },
        shipmentAddressLine2: {
          type: 'string',
          maxLength: 255,
          example: 'Suite 200',
        },
        shipmentAddressCity: {
          type: 'string',
          minLength: 1,
          maxLength: 255,
          example: 'Boston',
        },
        shipmentAddressState: {
          type: 'string',
          minLength: 1,
          maxLength: 255,
          example: 'MA',
        },
        shipmentAddressZip: {
          type: 'string',
          minLength: 1,
          maxLength: 255,
          example: '02101',
        },
        shipmentAddressCountry: {
          type: 'string',
          maxLength: 255,
          example: 'United States',
        },
        mailingAddressLine1: {
          type: 'string',
          minLength: 1,
          maxLength: 255,
          example: '456 Main Street',
        },
        mailingAddressLine2: {
          type: 'string',
          maxLength: 255,
          example: 'Suite 200',
        },
        mailingAddressCity: {
          type: 'string',
          minLength: 1,
          maxLength: 255,
          example: 'Boston',
        },
        mailingAddressState: {
          type: 'string',
          minLength: 1,
          maxLength: 255,
          example: 'MA',
        },
        mailingAddressZip: {
          type: 'string',
          minLength: 1,
          maxLength: 255,
          example: '02101',
        },
        mailingAddressCountry: {
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
        acceptFoodDeliveries: {
          type: 'boolean',
          example: true,
        },
        deliveryWindowInstructions: {
          type: 'string',
          example: 'Deliveries can be made between 9 AM and 5 PM on weekdays.',
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
          maxLength: 255,
          example:
            'We would be willing to implement these activities over the next quarter',
        },
        itemsInStock: {
          type: 'string',
          minLength: 1,
          maxLength: 255,
          example: 'Rice, pasta, canned vegetables, gluten-free bread',
        },
        needMoreOptions: {
          type: 'string',
          minLength: 1,
          maxLength: 255,
          example: 'Quite often',
        },
        newsletterSubscription: {
          type: 'boolean',
          example: true,
        },
      },
      required: [
        'contactFirstName',
        'contactLastName',
        'contactEmail',
        'contactPhone',
        'hasEmailContact',
        'pantryName',
        'shipmentAddressLine1',
        'shipmentAddressCity',
        'shipmentAddressState',
        'shipmentAddressZip',
        'mailingAddressLine1',
        'mailingAddressCity',
        'mailingAddressState',
        'mailingAddressZip',
        'allergenClients',
        'refrigeratedDonation',
        'acceptFoodDeliveries',
        'reserveFoodForAllergic',
        'dedicatedAllergyFriendly',
        'activities',
        'itemsInStock',
        'needMoreOptions',
      ],
    },
  })
  @Public()
  @Post()
  async submitPantryApplication(
    @Body(new ValidationPipe())
    pantryData: PantryApplicationDto,
  ): Promise<void> {
    return this.pantriesService.addPantry(pantryData);
  }

  @Roles(Role.ADMIN)
  @Patch('/:pantryId/approve')
  async approvePantry(
    @Param('pantryId', ParseIntPipe) pantryId: number,
  ): Promise<void> {
    return this.pantriesService.approve(pantryId);
  }

  @Roles(Role.ADMIN)
  @Patch('/:pantryId/deny')
  async denyPantry(
    @Param('pantryId', ParseIntPipe) pantryId: number,
  ): Promise<void> {
    return this.pantriesService.deny(pantryId);
  }

  @Post('/email')
  async sendEmail(@Body() sendEmailDTO: SendEmailDTO): Promise<void> {
    const { toEmails, subject, bodyHtml, attachments } = sendEmailDTO;

    await this.emailsService.sendEmails(
      toEmails,
      subject,
      bodyHtml,
      attachments,
    );
  }
}
