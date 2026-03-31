import { Test, TestingModule } from '@nestjs/testing';
import { PantriesService } from './pantries.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Pantry } from './pantries.entity';
import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PantryApplicationDto } from './dtos/pantry-application.dto';
import {
  ClientVisitFrequency,
  RefrigeratedDonation,
  ServeAllergicChildren,
  ReserveFoodForAllergic,
  Activity,
  AllergensConfidence,
} from './types';
import { ApplicationStatus } from '../shared/types';
import { testDataSource } from '../config/typeormTestDataSource';
import { Order } from '../orders/order.entity';
import { FoodRequest } from '../foodRequests/request.entity';
import { RequestsService } from '../foodRequests/request.service';
import { OrdersService } from '../orders/order.service';
import { UsersService } from '../users/users.service';
import { AuthService } from '../auth/auth.service';
import { DonationItem } from '../donationItems/donationItems.entity';
import { DonationItemsService } from '../donationItems/donationItems.service';
import { DonationService } from '../donations/donations.service';
import { Donation } from '../donations/donations.entity';
import { FoodManufacturersService } from '../foodManufacturers/manufacturers.service';
import { FoodManufacturer } from '../foodManufacturers/manufacturers.entity';
import { User } from '../users/users.entity';
import { UpdatePantryApplicationDto } from './dtos/update-pantry-application.dto';
import { EmailsService } from '../emails/email.service';
import { mock } from 'jest-mock-extended';
import { emailTemplates, SSF_PARTNER_EMAIL } from '../emails/emailTemplates';

jest.setTimeout(60000);

// Minimal DTO factory to reduce repetition in bulk-creation tests
const makePantryDto = (i: number): PantryApplicationDto =>
  ({
    contactFirstName: `Bulk${i}`,
    contactLastName: 'Tester',
    contactEmail: `bulk${i}@example.com`,
    contactPhone: '555-000-0000',
    hasEmailContact: false,
    pantryName: `BulkTest Pantry ${i}`,
    shipmentAddressLine1: '1 Bulk St',
    shipmentAddressCity: 'Testville',
    shipmentAddressState: 'TS',
    shipmentAddressZip: '00000',
    mailingAddressLine1: '1 Bulk St',
    mailingAddressCity: 'Testville',
    mailingAddressState: 'TS',
    mailingAddressZip: '00000',
    allergenClients: 'none',
    restrictions: ['none'],
    refrigeratedDonation: RefrigeratedDonation.NO,
    acceptFoodDeliveries: false,
    reserveFoodForAllergic: ReserveFoodForAllergic.NO,
    dedicatedAllergyFriendly: false,
    activities: [Activity.CREATE_LABELED_SHELF],
    itemsInStock: 'none',
    needMoreOptions: 'none',
  } as PantryApplicationDto);

const dto: PantryApplicationDto = {
  contactFirstName: 'Jane',
  contactLastName: 'Doe',
  contactEmail: 'jane.doe@example.com',
  contactPhone: '555-555-5555',
  hasEmailContact: true,
  pantryName: 'Test Pantry',
  shipmentAddressLine1: '1 Test St',
  shipmentAddressCity: 'Testville',
  shipmentAddressState: 'TX',
  shipmentAddressZip: '11111',
  mailingAddressLine1: '1 Test St',
  mailingAddressCity: 'Testville',
  mailingAddressState: 'TX',
  mailingAddressZip: '11111',
  allergenClients: 'none',
  restrictions: ['none'],
  refrigeratedDonation: RefrigeratedDonation.NO,
  acceptFoodDeliveries: false,
  reserveFoodForAllergic: ReserveFoodForAllergic.NO,
  dedicatedAllergyFriendly: false,
  activities: [Activity.CREATE_LABELED_SHELF],
  itemsInStock: 'none',
  needMoreOptions: 'none',
};

const mockEmailsService = mock<EmailsService>();

describe('PantriesService', () => {
  let service: PantriesService;
  let testModule: TestingModule;

  beforeAll(async () => {
    mockEmailsService.sendEmails.mockResolvedValue(undefined);

    if (!testDataSource.isInitialized) {
      await testDataSource.initialize();
    }
    await testDataSource.query(`DROP SCHEMA IF EXISTS public CASCADE`);
    await testDataSource.query(`CREATE SCHEMA public`);

    testModule = await Test.createTestingModule({
      providers: [
        PantriesService,
        OrdersService,
        RequestsService,
        UsersService,
        DonationItemsService,
        DonationService,
        FoodManufacturersService,
        {
          provide: AuthService,
          useValue: {
            adminCreateUser: jest.fn().mockResolvedValue('test-sub'),
          },
        },
        {
          provide: EmailsService,
          useValue: mockEmailsService,
        },
        {
          provide: getRepositoryToken(Pantry),
          useValue: testDataSource.getRepository(Pantry),
        },
        {
          provide: getRepositoryToken(User),
          useValue: testDataSource.getRepository(User),
        },
        {
          provide: getRepositoryToken(Order),
          useValue: testDataSource.getRepository(Order),
        },
        {
          provide: getRepositoryToken(FoodRequest),
          useValue: testDataSource.getRepository(FoodRequest),
        },
        {
          provide: getRepositoryToken(DonationItem),
          useValue: testDataSource.getRepository(DonationItem),
        },
        {
          provide: getRepositoryToken(Donation),
          useValue: testDataSource.getRepository(Donation),
        },
        {
          provide: getRepositoryToken(FoodManufacturer),
          useValue: testDataSource.getRepository(FoodManufacturer),
        },
      ],
    }).compile();

    service = testModule.get<PantriesService>(PantriesService);
  });

  beforeEach(async () => {
    mockEmailsService.sendEmails.mockClear();
    await testDataSource.runMigrations();
  });

  afterEach(async () => {
    await testDataSource.query(`DROP SCHEMA public CASCADE`);
    await testDataSource.query(`CREATE SCHEMA public`);
  });

  afterAll(async () => {
    if (testDataSource.isInitialized) {
      await testDataSource.destroy();
    }
  });

  it('service should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('returns pantry by existing ID', async () => {
      const pantry = await service.findOne(1);
      expect(pantry).toBeDefined();
      expect(pantry.pantryId).toBe(1);
    });

    it('throws NotFoundException for missing ID', async () => {
      await expect(service.findOne(9999)).rejects.toThrow(
        new NotFoundException('Pantry 9999 not found'),
      );
    });
  });

  describe('getPendingPantries', () => {
    it('returns pantries with pending status', async () => {
      const pending = await service.getPendingPantries();
      expect(pending.length).toBeGreaterThan(0);
      expect(pending.every((p) => p.status === ApplicationStatus.PENDING)).toBe(
        true,
      );
    });
  });

  describe('approve', () => {
    it('approves a pending pantry', async () => {
      const pantryBefore = await service.findOne(5);
      expect(pantryBefore.status).toBe(ApplicationStatus.PENDING);
      await service.approve(5);
      const pantryAfter = await service.findOne(5);
      expect(pantryAfter.status).toBe(ApplicationStatus.APPROVED);
    });

    it('sends approval email to pantry user', async () => {
      const pantry = await service.findOne(5);
      const { subject, bodyHTML } = emailTemplates.pantryFmApplicationApproved({
        name: pantry.pantryUser.firstName,
      });

      await service.approve(5);

      expect(mockEmailsService.sendEmails).toHaveBeenCalledTimes(1);
      expect(mockEmailsService.sendEmails).toHaveBeenCalledWith(
        [pantry.pantryUser.email],
        subject,
        bodyHTML,
      );
    });

    it('should still update pantry status to approved if email send fails', async () => {
      mockEmailsService.sendEmails.mockRejectedValueOnce(
        new Error('Email failed'),
      );

      await expect(service.approve(5)).rejects.toThrow(
        new InternalServerErrorException(
          'Failed to send pantry account approved notification email to representative',
        ),
      );

      const pantry = await service.findOne(5);
      expect(pantry.status).toBe(ApplicationStatus.APPROVED);
    });

    it('throws ConflictException when approving an already approved manufacturer', async () => {
      const beforeCount = await testDataSource.getRepository(User).count();

      await expect(service.approve(1)).rejects.toThrow(
        new ConflictException('Cannot approve a pantry with status: approved'),
      );

      const afterCount = await testDataSource.getRepository(User).count();
      expect(afterCount).toBe(beforeCount);
      expect(mockEmailsService.sendEmails).not.toHaveBeenCalled();
    });

    it('throws when approving non-existent', async () => {
      await expect(service.approve(9999)).rejects.toThrow(
        new NotFoundException('Pantry 9999 not found'),
      );
    });
  });

  describe('deny', () => {
    it('denies a pending pantry', async () => {
      const pantryBefore = await service.findOne(6);
      expect(pantryBefore.status).toBe(ApplicationStatus.PENDING);
      await service.deny(6);
      const pantryAfter = await service.findOne(6);
      expect(pantryAfter.status).toBe(ApplicationStatus.DENIED);
    });

    it('throws ConflictException when denying an already approved pantry', async () => {
      // Pantry 1 ('Community Food Pantry Downtown') has status 'approved' in dummy data
      await expect(service.deny(1)).rejects.toThrow(
        new ConflictException('Cannot deny a pantry with status: approved'),
      );

      expect(mockEmailsService.sendEmails).not.toHaveBeenCalled();
    });

    it('throws when denying non-existent', async () => {
      await expect(service.deny(9999)).rejects.toThrow(
        new NotFoundException('Pantry 9999 not found'),
      );
    });
  });

  describe('addPantry', () => {
    it('creates pantry with minimal required fields', async () => {
      await service.addPantry(dto);
      const saved = await testDataSource.getRepository(Pantry).findOne({
        where: { pantryName: 'Test Pantry' },
        relations: ['pantryUser'],
      });
      expect(saved).toBeDefined();
      expect(saved?.pantryUser?.email).toBe('jane.doe@example.com');
      expect(saved?.status).toBe(ApplicationStatus.PENDING);
    });

    it('creates pantry with all optional fields included', async () => {
      const optionalDto: PantryApplicationDto = {
        ...dto,
        pantryName: 'Test Full Pantry',
        contactEmail: 'john.smith@example.com',
        emailContactOther: 'Use work phone',
        secondaryContactFirstName: 'Sarah',
        secondaryContactLastName: 'Johnson',
        secondaryContactEmail: 'sarah.johnson@example.com',
        secondaryContactPhone: '555-555-5557',
        shipmentAddressLine2: 'Suite 200',
        shipmentAddressCountry: 'USA',
        mailingAddressLine2: 'Suite 200',
        mailingAddressCountry: 'USA',
        refrigeratedDonation: RefrigeratedDonation.YES,
        acceptFoodDeliveries: true,
        deliveryWindowInstructions: 'Weekdays 9am-5pm',
        reserveFoodForAllergic: ReserveFoodForAllergic.SOME,
        reservationExplanation: 'We have a dedicated section',
        dedicatedAllergyFriendly: true,
        clientVisitFrequency: ClientVisitFrequency.DAILY,
        identifyAllergensConfidence: AllergensConfidence.VERY_CONFIDENT,
        serveAllergicChildren: ServeAllergicChildren.YES_MANY,
        activities: [Activity.CREATE_LABELED_SHELF, Activity.COLLECT_FEEDBACK],
        activitiesComments: 'We are committed to allergen management',
        newsletterSubscription: true,
      };

      await service.addPantry(optionalDto);
      const saved = await testDataSource.getRepository(Pantry).findOne({
        where: { pantryName: 'Test Full Pantry' },
        relations: ['pantryUser'],
      });
      expect(saved).toBeDefined();
      expect(saved?.pantryUser?.email).toBe('john.smith@example.com');
      expect(saved?.status).toBe(ApplicationStatus.PENDING);
      expect(saved?.secondaryContactFirstName).toBe('Sarah');
      expect(saved?.shipmentAddressLine2).toBe('Suite 200');
    });

    it('should still save pantry to database if representative email send fails', async () => {
      mockEmailsService.sendEmails.mockRejectedValueOnce(
        new Error('Email failed'),
      );

      await expect(service.addPantry(dto)).rejects.toThrow(
        new InternalServerErrorException(
          'Failed to send pantry application submitted confirmation email to representative',
        ),
      );

      const saved = await testDataSource.getRepository(Pantry).findOne({
        where: { pantryName: 'Test Pantry' },
        relations: ['pantryUser'],
      });
      expect(saved).toBeDefined();
      expect(saved?.status).toBe(ApplicationStatus.PENDING);
    });

    it('should still save pantry to database if admin notification email send fails', async () => {
      mockEmailsService.sendEmails
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce(new Error('Email failed'));

      await expect(service.addPantry(dto)).rejects.toThrow(
        new InternalServerErrorException(
          'Failed to send new pantry application notification email to SSF',
        ),
      );

      const saved = await testDataSource.getRepository(Pantry).findOne({
        where: { pantryName: 'Test Pantry' },
        relations: ['pantryUser'],
      });
      expect(saved).toBeDefined();
      expect(saved?.status).toBe(ApplicationStatus.PENDING);
    });

    it('sends confirmation email to applicant and notification email to admin', async () => {
      await service.addPantry(dto);

      const userMessage = emailTemplates.pantryFmApplicationSubmittedToUser({
        name: dto.contactFirstName,
      });
      const adminMessage = emailTemplates.pantryFmApplicationSubmittedToAdmin();

      expect(mockEmailsService.sendEmails).toHaveBeenCalledWith(
        [dto.contactEmail],
        userMessage.subject,
        userMessage.bodyHTML,
      );
      expect(mockEmailsService.sendEmails).toHaveBeenCalledWith(
        [SSF_PARTNER_EMAIL],
        adminMessage.subject,
        adminMessage.bodyHTML,
      );
      expect(mockEmailsService.sendEmails).toHaveBeenCalledTimes(2);
    });
  });

  describe('updatePantryApplication', () => {
    it('updates an existing pantry successfully', async () => {
      const dto: UpdatePantryApplicationDto = {
        secondaryContactFirstName: 'John',
        secondaryContactLastName: 'Doe',
        refrigeratedDonation: RefrigeratedDonation.YES,
        reserveFoodForAllergic: ReserveFoodForAllergic.SOME,
        newsletterSubscription: true,
        itemsInStock: 'Canned beans, rice',
      };

      const updatedPantry = await service.updatePantryApplication(1, dto, 10);

      expect(updatedPantry.secondaryContactFirstName).toBe('John');
      expect(updatedPantry.secondaryContactLastName).toBe('Doe');
      expect(updatedPantry.refrigeratedDonation).toBe(RefrigeratedDonation.YES);
      expect(updatedPantry.reserveFoodForAllergic).toBe(
        ReserveFoodForAllergic.SOME,
      );
      expect(updatedPantry.newsletterSubscription).toBe(true);
      expect(updatedPantry.itemsInStock).toBe('Canned beans, rice');
    });

    it('throws NotFoundException when pantry does not exist', async () => {
      const dto: UpdatePantryApplicationDto = {
        secondaryContactFirstName: 'Jane',
      };

      await expect(
        service.updatePantryApplication(9999, dto, 1),
      ).rejects.toThrow(new NotFoundException('Pantry 9999 not found'));
    });

    it('updates only the provided fields and keeps others intact', async () => {
      const original = await service.findOne(2);

      const dto: UpdatePantryApplicationDto = {
        itemsInStock: 'Rice and beans',
      };

      const updated = await service.updatePantryApplication(2, dto, 11);

      expect(updated.itemsInStock).toBe('Rice and beans');
      expect(updated.pantryName).toBe(original.pantryName);
      expect(updated.secondaryContactEmail).toBe(
        original.secondaryContactEmail,
      );
    });

    it('throws BadRequestException when user is not authorized to update pantry', async () => {
      const dto: UpdatePantryApplicationDto = {
        itemsInStock: 'Rice and beans',
      };

      const invalidUserId = 999;

      await expect(
        service.updatePantryApplication(1, dto, invalidUserId),
      ).rejects.toThrow(
        new BadRequestException(
          `User ${invalidUserId} is not allowed to edit application for Pantry 1`,
        ),
      );
    });
  });

  describe('getPantryStats (single pantry)', () => {
    it('throws NotFoundException for non-existent pantry names', async () => {
      await expect(
        service.getPantryStats(['Nonexistent Pantry']),
      ).rejects.toThrow(
        new NotFoundException('Pantries not found: Nonexistent Pantry'),
      );
    });

    it('throws NotFoundException when some provided pantry names do not exist', async () => {
      await expect(
        service.getPantryStats([
          'Community Food Pantry Downtown',
          'Fake Pantry',
        ]),
      ).rejects.toThrow(
        new NotFoundException('Pantries not found: Fake Pantry'),
      );
    });

    it('error message includes the missing pantry name', async () => {
      await expect(
        service.getPantryStats([
          'Community Food Pantry Downtown',
          'Fake Pantry',
        ]),
      ).rejects.toThrow('Pantries not found: Fake Pantry');
    });

    it('returns accurate aggregated stats for pantry with orders (Community Food Pantry Downtown)', async () => {
      const stats = (
        await service.getPantryStats(['Community Food Pantry Downtown'])
      )[0];

      expect(stats.pantryId).toBe(1);
      expect(stats.totalItems).toBe(125);
      expect(stats.totalOz).toBeCloseTo(2320.05, 2);
      expect(stats.totalLbs).toBeCloseTo(145.0, 2);
      expect(stats.totalDonatedFoodValue).toBeCloseTo(625.0, 2);
      expect(stats.totalValue).toBeCloseTo(645.0, 2);
      expect(stats.percentageFoodRescueItems).toBe(0);
    });

    it('throws NotFoundException for a non-approved (denied) pantry', async () => {
      await expect(
        service.getPantryStats(['Riverside Food Assistance']),
      ).rejects.toThrow(
        new NotFoundException('Pantries not found: Riverside Food Assistance'),
      );
    });

    it('throws NotFoundException for a non-approved (pending) pantry', async () => {
      await expect(
        service.getPantryStats(['Harbor Community Center']),
      ).rejects.toThrow(
        new NotFoundException('Pantries not found: Harbor Community Center'),
      );
    });

    it('respects year filter and returns zeros for a non-matching year', async () => {
      const stats = (
        await service.getPantryStats(['Community Food Pantry Downtown'], [2030])
      )[0];

      expect(stats.pantryId).toBe(1);
      expect(stats.totalItems).toBe(0);
      expect(stats.totalOz).toBe(0);
      expect(stats.totalLbs).toBe(0);
      expect(stats.totalDonatedFoodValue).toBe(0);
      expect(stats.totalShippingCost).toBe(0);
      expect(stats.totalValue).toBe(0);
      expect(stats.percentageFoodRescueItems).toBe(0);
    });
  });

  describe('getPantryStats', () => {
    it('filters by pantry name correctly and returns accurate sums', async () => {
      const stats = await service.getPantryStats([
        'Community Food Pantry Downtown',
        'Westside Community Kitchen',
      ]);
      expect(stats.length).toBe(2);

      const community = stats.find((s) => s.pantryId === 1);
      const westside = stats.find((s) => s.pantryId === 2);

      expect(community).toBeDefined();
      expect(community?.totalItems).toBe(125);
      expect(community?.totalOz).toBeCloseTo(2320.05, 2);

      expect(westside).toBeDefined();
      expect(westside?.totalItems).toBe(65);
      expect(westside?.totalOz).toBeCloseTo(1195.0, 2);
    });

    it('accepts single pantry name as string', async () => {
      const stats = await service.getPantryStats([
        'Community Food Pantry Downtown',
      ]);
      expect(stats.length).toBe(1);
      expect(stats[0].pantryId).toBe(1);
    });

    it('pagination beyond range returns empty array', async () => {
      const paged = await service.getPantryStats(undefined, undefined, 100);
      expect(paged.length).toBe(0);
    });

    it('filters by year correctly (no results for future year)', async () => {
      const yearFiltered = await service.getPantryStats(undefined, [2030]);
      expect(yearFiltered.every((s) => s.totalItems === 0)).toBe(true);
    });

    it('pagination page returns first 10 items', async () => {
      for (let i = 0; i < 10; i++) {
        await service.addPantry(makePantryDto(i));
      }
      await testDataSource.query(
        `UPDATE public.pantries SET status = 'approved' WHERE pantry_name LIKE 'BulkTest Pantry%'`,
      );

      const page1 = await service.getPantryStats(undefined, undefined, 1);
      expect(page1.length).toBe(10);
    });

    it('year filter isolates orders by year (move one delivered order to 2025)', async () => {
      await testDataSource.query(`
        UPDATE public.orders
        SET created_at = '2025-01-16 09:00:00'
        WHERE order_id = (
          SELECT o.order_id FROM public.orders o
          JOIN public.food_requests r ON o.request_id = r.request_id
          WHERE r.pantry_id = (
            SELECT pantry_id FROM public.pantries WHERE pantry_name = 'Community Food Pantry Downtown' LIMIT 1
          ) AND o.status = 'delivered'
          ORDER BY o.order_id DESC
          LIMIT 1
        )
      `);

      const res = await service.getPantryStats(undefined, [2025]);
      const community = res.find((s) => s.pantryId === 1);
      expect(community).toBeDefined();
      expect(community?.totalItems).toBe(40);
      expect(community?.totalDonatedFoodValue).toBeCloseTo(130.0, 2);
    });

    it('returns only approved pantries when no names given', async () => {
      const stats = await service.getPantryStats();
      expect(stats.length).toBe(3);
      const names = stats.map((s) => s.pantryName);
      expect(names).not.toContain('Riverside Food Assistance');
      expect(names).not.toContain('Harbor Community Center');
      expect(names).not.toContain('Southside Pantry Network');
    });

    it('returns nothing for an invalid pantry name', async () => {
      await expect(
        service.getPantryStats(['Invalid Pantry Name']),
      ).rejects.toThrow(
        new NotFoundException(`Pantries not found: Invalid Pantry Name`),
      );
    });

    it('throws an error for a page less than 1', async () => {
      await expect(
        service.getPantryStats(undefined, undefined, 0),
      ).rejects.toThrow(
        new BadRequestException('Page number must be greater than 0'),
      );
    });

    it('validates all names before paginating — throws if any name is invalid regardless of page', async () => {
      // Create 12 valid approved pantries so we have enough to paginate
      for (let i = 0; i < 12; i++) {
        await service.addPantry(makePantryDto(i));
      }
      await testDataSource.query(
        `UPDATE public.pantries SET status = 'approved' WHERE pantry_name LIKE 'BulkTest Pantry%'`,
      );
      const validNames = Array.from(
        { length: 12 },
        (_, i) => `BulkTest Pantry ${i}`,
      );

      await expect(
        service.getPantryStats([...validNames, 'Extra Pantry'], undefined, 1),
      ).rejects.toThrow('Pantries not found: Extra Pantry');

      await expect(
        service.getPantryStats([...validNames, 'Extra Pantry'], undefined, 2),
      ).rejects.toThrow('Pantries not found: Extra Pantry');
    });

    it('with 12 valid names, page 1 returns the first 10 (ordered by pantryId ASC)', async () => {
      for (let i = 0; i < 12; i++) {
        await service.addPantry(makePantryDto(i));
      }
      await testDataSource.query(
        `UPDATE public.pantries SET status = 'approved' WHERE pantry_name LIKE 'BulkTest Pantry%'`,
      );
      const names = Array.from(
        { length: 12 },
        (_, i) => `BulkTest Pantry ${i}`,
      );

      const page1 = await service.getPantryStats(names, undefined, 1);
      expect(page1.length).toBe(10);
    });

    it('with 12 valid names, page 2 returns the remaining 2', async () => {
      for (let i = 0; i < 12; i++) {
        await service.addPantry(makePantryDto(i));
      }
      await testDataSource.query(
        `UPDATE public.pantries SET status = 'approved' WHERE pantry_name LIKE 'BulkTest Pantry%'`,
      );
      const names = Array.from(
        { length: 12 },
        (_, i) => `BulkTest Pantry ${i}`,
      );

      const page2 = await service.getPantryStats(names, undefined, 2);
      expect(page2.length).toBe(2);
    });

    it('with 12 valid names, page 3 returns empty array', async () => {
      for (let i = 0; i < 12; i++) {
        await service.addPantry(makePantryDto(i));
      }
      await testDataSource.query(
        `UPDATE public.pantries SET status = 'approved' WHERE pantry_name LIKE 'BulkTest Pantry%'`,
      );
      const names = Array.from(
        { length: 12 },
        (_, i) => `BulkTest Pantry ${i}`,
      );

      const page3 = await service.getPantryStats(names, undefined, 3);
      expect(page3.length).toBe(0);
    });

    it('page 1 and page 2 results are disjoint (no overlapping pantryIds)', async () => {
      for (let i = 0; i < 12; i++) {
        await service.addPantry(makePantryDto(i));
      }
      await testDataSource.query(
        `UPDATE public.pantries SET status = 'approved' WHERE pantry_name LIKE 'BulkTest Pantry%'`,
      );
      const names = Array.from(
        { length: 12 },
        (_, i) => `BulkTest Pantry ${i}`,
      );

      const [page1, page2] = await Promise.all([
        service.getPantryStats(names, undefined, 1),
        service.getPantryStats(names, undefined, 2),
      ]);

      const page1Ids = new Set(page1.map((s) => s.pantryId));
      const overlap = page2.filter((s) => page1Ids.has(s.pantryId));
      expect(overlap.length).toBe(0);
    });
  });

  describe('getApprovedPantryNames', () => {
    it('returns the 3 approved pantry names from seed data', async () => {
      const names = await service.getApprovedPantryNames();

      expect(names).toHaveLength(3);
      expect(names).toContain('Community Food Pantry Downtown');
      expect(names).toContain('Westside Community Kitchen');
      expect(names).toContain('North End Food Bank');
    });

    it('returns an empty array when no pantries are approved', async () => {
      await testDataSource.query(
        `UPDATE public.pantries SET status = 'pending' WHERE status = 'approved'`,
      );

      const names = await service.getApprovedPantryNames();

      expect(names).toEqual([]);
    });
  });

  describe('getTotalStats', () => {
    it('aggregates stats across all pantries and matches migration sums', async () => {
      const total = await service.getTotalStats();

      expect(total.totalItems).toBe(220);
      expect(total.totalOz).toBeCloseTo(4530.05, 2);
      expect(total.totalLbs).toBeCloseTo(283.13, 2);
      expect(total.totalDonatedFoodValue).toBeCloseTo(1087.5, 2);
      expect(total.totalShippingCost).toBeCloseTo(60.0, 2);
      expect(total.totalValue).toBeCloseTo(1147.5, 2);
    });

    it('respects year filter and returns zeros for non-matching years', async () => {
      const totalEmpty = await service.getTotalStats([2030]);
      expect(totalEmpty.totalItems).toBe(0);
      expect(totalEmpty.totalOz).toBe(0);
      expect(totalEmpty.totalLbs).toBe(0);
      expect(totalEmpty.totalDonatedFoodValue).toBe(0);
      expect(totalEmpty.totalShippingCost).toBe(0);
      expect(totalEmpty.totalValue).toBe(0);
      expect(totalEmpty.percentageFoodRescueItems).toBe(0);
    });

    it('returns all zeros when no approved pantries exist', async () => {
      await testDataSource.query(
        `UPDATE public.pantries SET status = 'pending' WHERE status = 'approved'`,
      );
      const total = await service.getTotalStats();
      expect(total.totalItems).toBe(0);
      expect(total.totalOz).toBe(0);
      expect(total.totalLbs).toBe(0);
      expect(total.totalDonatedFoodValue).toBe(0);
      expect(total.totalShippingCost).toBe(0);
      expect(total.totalValue).toBe(0);
      expect(total.percentageFoodRescueItems).toBe(0);
    });
  });

  describe('getAvailableYears', () => {
    it('returns years from approved pantry orders sorted descending', async () => {
      await testDataSource.query(
        `UPDATE public.orders SET created_at = '2024-06-01 00:00:00'`,
      );

      const years = await service.getAvailableYears();

      expect(years).toEqual([2024]);
    });

    it('returns multiple years sorted descending', async () => {
      await testDataSource.query(`
        UPDATE public.orders
        SET created_at = '2025-01-01 00:00:00'
        WHERE order_id = (SELECT order_id FROM public.orders ORDER BY order_id LIMIT 1)
      `);
      await testDataSource.query(`
        UPDATE public.orders
        SET created_at = '2024-01-01 00:00:00'
        WHERE order_id != (SELECT order_id FROM public.orders ORDER BY order_id LIMIT 1)
      `);

      const years = await service.getAvailableYears();

      expect(years).toEqual([2025, 2024]);
    });

    it('returns empty array when no approved pantries exist', async () => {
      await testDataSource.query(
        `UPDATE public.pantries SET status = 'pending' WHERE status = 'approved'`,
      );

      const years = await service.getAvailableYears();

      expect(years).toEqual([]);
    });

    it('excludes years from non-approved pantry orders', async () => {
      await testDataSource.query(
        `UPDATE public.orders SET created_at = '2024-06-01 00:00:00'`,
      );
      await testDataSource.query(
        `UPDATE public.pantries SET status = 'pending' WHERE status = 'approved'`,
      );

      const years = await service.getAvailableYears();

      expect(years).toEqual([]);
    });
  });

  describe('findByIds', () => {
    it('findByIds success', async () => {
      const found = await service.findByIds([1, 2]);
      expect(found.map((p) => p.pantryId)).toEqual([1, 2]);
    });

    it('findByIds with some non-existent IDs throws NotFoundException', async () => {
      await expect(service.findByIds([1, 9999])).rejects.toThrow(
        new NotFoundException('Pantries not found: 9999'),
      );
    });
  });

  describe('findByUserId', () => {
    it('findByUserId success', async () => {
      const pantry = await service.findOne(1);
      const userId = pantry.pantryUser.id;
      const result = await service.findByUserId(userId);
      expect(result.pantryId).toBe(1);
    });

    it('findByUserId with non-existent user throws NotFoundException', async () => {
      await expect(service.findByUserId(9999)).rejects.toThrow(
        new NotFoundException('Pantry for User 9999 not found'),
      );
    });
  });

  describe('getApprovedPantriesWithVolunteers', () => {
    it('should return approved pantries with mapped volunteer info', async () => {
      const result = await service.getApprovedPantriesWithVolunteers();

      expect(result.length).toBeGreaterThan(0);
      expect(result.every((p) => p.pantryId)).toBe(true);
      expect(result.every((p) => p.pantryName)).toBe(true);
      result.forEach((p) => {
        expect(p.volunteers).toBeDefined();
        p.volunteers.forEach((v) => {
          expect(v.userId).toBeDefined();
          expect(v.firstName).toBeDefined();
          expect(v.lastName).toBeDefined();
          expect(v.email).toBeDefined();
          expect(v.phone).toBeDefined();
        });
      });
    });

    it('should return empty volunteers array when pantry has no volunteers', async () => {
      await service.addPantry({
        contactFirstName: 'Test',
        contactLastName: 'Pantry',
        contactEmail: 'test.novolunteers@example.com',
        contactPhone: '555-000-9999',
        hasEmailContact: false,
        pantryName: 'No Volunteer Pantry',
        shipmentAddressLine1: '1 Test St',
        shipmentAddressCity: 'Boston',
        shipmentAddressState: 'MA',
        shipmentAddressZip: '02101',
        mailingAddressLine1: '1 Test St',
        mailingAddressCity: 'Boston',
        mailingAddressState: 'MA',
        mailingAddressZip: '02101',
        allergenClients: 'none',
        restrictions: ['none'],
        refrigeratedDonation: RefrigeratedDonation.NO,
        acceptFoodDeliveries: false,
        reserveFoodForAllergic: ReserveFoodForAllergic.NO,
        dedicatedAllergyFriendly: false,
        activities: [Activity.CREATE_LABELED_SHELF],
        itemsInStock: 'none',
        needMoreOptions: 'none',
      } as PantryApplicationDto);

      const saved = await testDataSource.getRepository(Pantry).findOne({
        where: { pantryName: 'No Volunteer Pantry' },
      });
      await testDataSource.getRepository(Pantry).update(saved!.pantryId, {
        status: ApplicationStatus.APPROVED,
      });

      const result = await service.getApprovedPantriesWithVolunteers();
      const pantryWithNoVolunteers = result.find(
        (p) => p.pantryName === 'No Volunteer Pantry',
      );
      expect(pantryWithNoVolunteers).toBeDefined();
      expect(pantryWithNoVolunteers?.volunteers).toEqual([]);
    });

    it('should return empty array when no approved pantries exist', async () => {
      await testDataSource.query(
        `UPDATE pantries SET status = 'pending' WHERE status = 'approved'`,
      );
      const result = await service.getApprovedPantriesWithVolunteers();
      expect(result).toEqual([]);
    });
  });

  describe('updatePantryVolunteers', () => {
    const getVolunteerId = async (email: string) =>
      (
        await testDataSource.query(
          `SELECT user_id FROM users WHERE email = $1 LIMIT 1`,
          [email],
        )
      )[0].user_id;

    it('replaces volunteer set', async () => {
      const williamId = Number(await getVolunteerId('william.m@volunteer.org'));
      await service.updatePantryVolunteers(1, [williamId]);
      const pantry = await testDataSource
        .getRepository(Pantry)
        .findOne({ where: { pantryId: 1 }, relations: ['volunteers'] });
      expect(pantry?.volunteers).toHaveLength(1);
      expect(pantry?.volunteers?.[0].id).toBe(williamId);
    });

    it('throws NotFoundException when pantry not found', async () => {
      const williamId = Number(await getVolunteerId('william.m@volunteer.org'));
      await expect(
        service.updatePantryVolunteers(9999, [williamId]),
      ).rejects.toThrow(new NotFoundException('Pantry with ID 9999 not found'));
    });

    it('throws NotFoundException when volunteer id does not exist', async () => {
      await expect(service.updatePantryVolunteers(1, [99999])).rejects.toThrow(
        new NotFoundException('One or more users not found'),
      );
    });

    it('throws BadRequestException when user is not a volunteer', async () => {
      const adminId = Number(await getVolunteerId('john.smith@ssf.org'));
      await expect(
        service.updatePantryVolunteers(1, [adminId]),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
