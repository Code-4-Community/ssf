import { Test, TestingModule } from '@nestjs/testing';
import { FoodManufacturersService } from './manufacturers.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FoodManufacturer } from './manufacturers.entity';
import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { FoodManufacturerApplicationDto } from './dtos/manufacturer-application.dto';
import { ApplicationStatus } from '../shared/types';
import { testDataSource } from '../config/typeormTestDataSource';
import { Donation } from '../donations/donations.entity';
import { User } from '../users/users.entity';
import { UsersService } from '../users/users.service';
import { AuthService } from '../auth/auth.service';
import { EmailsService } from '../emails/email.service';
import { Pantry } from '../pantries/pantries.entity';
import { Order } from '../orders/order.entity';
import { FoodRequest } from '../foodRequests/request.entity';
import { DonationItem } from '../donationItems/donationItems.entity';
import { DonationService } from '../donations/donations.service';
import { PantriesService } from '../pantries/pantries.service';
import { mock } from 'jest-mock-extended';
import { emailTemplates, SSF_PARTNER_EMAIL } from '../emails/emailTemplates';
import { Allergen, DonateWastedFood, ManufacturerAttribute } from './types';
import { DataSource } from 'typeorm';
import { FoodType } from '../donationItems/types';

jest.setTimeout(60000);

const dto: FoodManufacturerApplicationDto = {
  foodManufacturerName: 'Test Manufacturer',
  foodManufacturerWebsite: 'https://testmanufacturer.com',
  contactFirstName: 'Jane',
  contactLastName: 'Doe',
  contactEmail: 'jane.doe@example.com',
  contactPhone: '555-555-5555',
  unlistedProductAllergens: [Allergen.SHELLFISH, Allergen.TREE_NUTS],
  facilityFreeAllergens: [Allergen.PEANUT, Allergen.FISH],
  productsGlutenFree: false,
  productsContainSulfites: false,
  productsSustainableExplanation: 'none',
  inKindDonations: false,
  donateWastedFood: DonateWastedFood.ALWAYS,
};

const mockEmailsService = mock<EmailsService>();

describe('FoodManufacturersService', () => {
  let service: FoodManufacturersService;
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
        FoodManufacturersService,
        UsersService,
        DonationService,
        PantriesService,
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
          provide: getRepositoryToken(FoodManufacturer),
          useValue: testDataSource.getRepository(FoodManufacturer),
        },
        {
          provide: getRepositoryToken(User),
          useValue: testDataSource.getRepository(User),
        },
        {
          provide: getRepositoryToken(Donation),
          useValue: testDataSource.getRepository(Donation),
        },
        {
          provide: getRepositoryToken(Pantry),
          useValue: testDataSource.getRepository(Pantry),
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
          provide: DataSource,
          useValue: testDataSource,
        },
      ],
    }).compile();

    service = testModule.get<FoodManufacturersService>(
      FoodManufacturersService,
    );
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
    it('returns manufacturer by existing ID', async () => {
      const manufacturer = await service.findOne(1);
      expect(manufacturer).toBeDefined();
      expect(manufacturer.foodManufacturerId).toBe(1);
    });

    it('throws NotFoundException for missing ID', async () => {
      await expect(service.findOne(9999)).rejects.toThrow(
        new NotFoundException('Food Manufacturer 9999 not found'),
      );
    });
  });

  describe('getPendingManufacturers', () => {
    it('returns manufacturers with pending status', async () => {
      const pending = await service.getPendingManufacturers();
      expect(pending.length).toBeGreaterThan(0);
      expect(pending.every((m) => m.status === ApplicationStatus.PENDING)).toBe(
        true,
      );
    });
  });

  describe('approve', () => {
    it('approves a pending manufacturer', async () => {
      const pending = await service.getPendingManufacturers();
      const id = pending[0].foodManufacturerId;

      await service.approve(id);

      const approved = await service.findOne(id);
      expect(approved.status).toBe(ApplicationStatus.APPROVED);
    });

    it('sends approval email to manufacturer representative', async () => {
      const pending = await service.getPendingManufacturers();
      const manufacturer = pending[0];
      const id = manufacturer.foodManufacturerId;
      const { subject, bodyHTML } = emailTemplates.pantryFmApplicationApproved({
        name: manufacturer.foodManufacturerRepresentative.firstName,
      });

      await service.approve(id);

      expect(mockEmailsService.sendEmails).toHaveBeenCalledTimes(1);
      expect(mockEmailsService.sendEmails).toHaveBeenCalledWith(
        [manufacturer.foodManufacturerRepresentative.email],
        subject,
        bodyHTML,
      );
    });

    it('should still update manufacturer status to approved if email send fails', async () => {
      const pending = await service.getPendingManufacturers();
      const id = pending[0].foodManufacturerId;
      mockEmailsService.sendEmails.mockRejectedValueOnce(
        new Error('Email failed'),
      );

      await expect(service.approve(id)).rejects.toThrow(
        new InternalServerErrorException(
          'Failed to send food manufacturer account approved notification email to representative',
        ),
      );

      const approved = await service.findOne(id);
      expect(approved.status).toBe(ApplicationStatus.APPROVED);
    });

    it('throws ConflictException when approving an already approved manufacturer', async () => {
      const beforeUserCount = await testDataSource.getRepository(User).count();

      await expect(service.approve(1)).rejects.toThrow(
        new ConflictException(
          'Cannot approve a Food Manufacturer with status: approved',
        ),
      );

      const afterUserCount = await testDataSource.getRepository(User).count();
      expect(afterUserCount).toBe(beforeUserCount);
      expect(mockEmailsService.sendEmails).not.toHaveBeenCalled();
    });

    it('throws when approving non-existent manufacturer', async () => {
      await expect(service.approve(9999)).rejects.toThrow(
        new NotFoundException('Food Manufacturer 9999 not found'),
      );
    });
  });

  describe('deny', () => {
    it('denies a pending manufacturer', async () => {
      const pending = await service.getPendingManufacturers();
      const id = pending[0].foodManufacturerId;

      await service.deny(id);

      const denied = await service.findOne(id);
      expect(denied.status).toBe(ApplicationStatus.DENIED);
      expect(mockEmailsService.sendEmails).not.toHaveBeenCalled();
    });

    it('throws ConflictException when denying an already approved manufacturer', async () => {
      // FM 1 ('FoodCorp Industries') has status 'approved' in dummy data
      await expect(service.deny(1)).rejects.toThrow(
        new ConflictException(
          'Cannot deny a Food Manufacturer with status: approved',
        ),
      );

      expect(mockEmailsService.sendEmails).not.toHaveBeenCalled();
    });

    it('throws when denying non-existent manufacturer', async () => {
      await expect(service.deny(9999)).rejects.toThrow(
        new NotFoundException('Food Manufacturer 9999 not found'),
      );
    });
  });

  describe('addFoodManufacturer', () => {
    it('creates manufacturer with minimal required fields', async () => {
      await service.addFoodManufacturer(dto);
      const saved = await testDataSource
        .getRepository(FoodManufacturer)
        .findOne({
          where: { foodManufacturerName: 'Test Manufacturer' },
          relations: ['foodManufacturerRepresentative'],
        });
      expect(saved).toBeDefined();
      expect(saved?.foodManufacturerRepresentative?.email).toBe(
        'jane.doe@example.com',
      );
      expect(saved?.status).toBe(ApplicationStatus.PENDING);
    });

    it('creates manufacturer with all optional fields included', async () => {
      const optionalDto: FoodManufacturerApplicationDto = {
        ...dto,
        foodManufacturerName: 'Test Full Manufacturer',
        contactEmail: 'john.smith@example.com',
        secondaryContactFirstName: 'Sarah',
        secondaryContactLastName: 'Johnson',
        secondaryContactEmail: 'sarah.johnson@example.com',
        secondaryContactPhone: '555-555-5557',
        manufacturerAttribute: ManufacturerAttribute.ORGANIC,
        additionalComments: 'We specialize in allergen-free products',
        newsletterSubscription: true,
      };

      await service.addFoodManufacturer(optionalDto);
      const saved = await testDataSource
        .getRepository(FoodManufacturer)
        .findOne({
          where: { foodManufacturerName: 'Test Full Manufacturer' },
          relations: ['foodManufacturerRepresentative'],
        });
      expect(saved).toBeDefined();
      expect(saved?.foodManufacturerRepresentative?.email).toBe(
        'john.smith@example.com',
      );
      expect(saved?.status).toBe(ApplicationStatus.PENDING);
      expect(saved?.secondaryContactFirstName).toBe('Sarah');
      expect(saved?.manufacturerAttribute).toBe(ManufacturerAttribute.ORGANIC);
    });

    it('should still save manufacturer to database if representative email send fails', async () => {
      mockEmailsService.sendEmails.mockRejectedValueOnce(
        new Error('Email failed'),
      );

      await expect(service.addFoodManufacturer(dto)).rejects.toThrow(
        new InternalServerErrorException(
          'Failed to send food manufacturer application submitted confirmation email to representative',
        ),
      );

      const saved = await testDataSource
        .getRepository(FoodManufacturer)
        .findOne({
          where: { foodManufacturerName: 'Test Manufacturer' },
          relations: ['foodManufacturerRepresentative'],
        });
      expect(saved).toBeDefined();
      expect(saved?.status).toBe(ApplicationStatus.PENDING);
    });

    it('should still save manufacturer to database if admin notification email send fails', async () => {
      mockEmailsService.sendEmails
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce(new Error('Email failed'));

      await expect(service.addFoodManufacturer(dto)).rejects.toThrow(
        new InternalServerErrorException(
          'Failed to send new food manufacturer application notification email to SSF',
        ),
      );

      const saved = await testDataSource
        .getRepository(FoodManufacturer)
        .findOne({
          where: { foodManufacturerName: 'Test Manufacturer' },
          relations: ['foodManufacturerRepresentative'],
        });
      expect(saved).toBeDefined();
      expect(saved?.status).toBe(ApplicationStatus.PENDING);
    });

    it('sends confirmation email to applicant and notification email to admin', async () => {
      await service.addFoodManufacturer(dto);

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

  describe('getFMDonations', () => {
    const fmRepId1 = 3;
    const fmRepId2 = 4;
    const fmId1 = 1;
    const fmId2 = 2;
    const availableDonationId = 1;
    const fulfilledDonationId = 4;
    const matchingDonationId = 3;

    it('throws NotFoundException for non-existent manufacturer', async () => {
      await expect(service.getFMDonations(9999, fmRepId1)).rejects.toThrow(
        new NotFoundException('Food Manufacturer 9999 not found'),
      );
    });

    it('throws BadRequestException when user is not the representative of the food manufacturer', async () => {
      await expect(service.getFMDonations(fmId1, fmRepId2)).rejects.toThrow(
        new BadRequestException(
          `User ${fmRepId2} is not allowed to access donations for Food Manufacturer ${fmId1}`,
        ),
      );
    });

    it('returns donations with empty payload for unmatched donations', async () => {
      const result = await service.getFMDonations(fmId1, fmRepId1);
      expect(result).toHaveLength(2);
      expect(result[0].donation.donationId).toBe(1);
      expect(result[0].associatedPendingOrders).toEqual([]);
      expect(result[0].relevantDonationItems).toEqual([]);
    });

    it('returns matched donations with empty orders and items when no pending orders exist', async () => {
      await testDataSource.query(
        `UPDATE public.donations SET status = 'matched' 
        WHERE donation_id = $1`,
        [availableDonationId],
      );

      const result = await service.getFMDonations(fmId1, fmRepId1);

      expect(result).toHaveLength(2);
      expect(result[0].associatedPendingOrders).toEqual([]);
      expect(result[0].relevantDonationItems).toEqual([]);
    });

    it('returns pending orders with correct pantry info for matched donations', async () => {
      await testDataSource.query(
        `UPDATE public.donations SET status = 'matched' WHERE donation_id = $1`,
        [fulfilledDonationId],
      );

      const result = await service.getFMDonations(fmId1, fmRepId1);
      const donation = result.find(
        (d) => d.donation.donationId === fulfilledDonationId,
      );

      expect(donation).toBeDefined();
      if (!donation) throw new Error('Missing donation test object');

      expect(donation.associatedPendingOrders).toHaveLength(1);

      const order = donation.associatedPendingOrders[0];
      expect(order.pantryName).toBe('Community Food Pantry Downtown');
      expect(order.pantryId).toBe(1);
      expect(order.orderId).toBeDefined();
    });

    it('returns unconfirmed donation items used in pending orders', async () => {
      await testDataSource.query(
        `UPDATE public.donations SET status = 'matched' WHERE donation_id = $1`,
        [fulfilledDonationId],
      );

      const result = await service.getFMDonations(fmId1, fmRepId1);
      const donation = result.find(
        (d) => d.donation.donationId === fulfilledDonationId,
      );

      expect(donation).toBeDefined();
      if (!donation) throw new Error('Missing donation test object');

      expect(donation.relevantDonationItems).toHaveLength(1);
      const item = donation.relevantDonationItems[0];
      expect(item.itemName).toBe('Cereal Boxes');
      expect(item.allocatedQuantity).toBe(75);
      expect(item.foodType).toBe(FoodType.GLUTEN_FREE_BREAD);
    });

    it('excludes donation items where detailsConfirmed is true', async () => {
      await testDataSource.query(
        `UPDATE public.donations SET status = 'matched' WHERE donation_id = $1`,
        [fulfilledDonationId],
      );

      await testDataSource.query(
        `UPDATE public.donation_items SET details_confirmed = true 
        WHERE item_name = 'Cereal Boxes'`,
      );

      const result = await service.getFMDonations(fmId1, fmRepId1);

      expect(result[0].relevantDonationItems).toEqual([]);
    });

    it('excludes donation items not used in any pending order', async () => {
      await testDataSource.query(
        `UPDATE public.donations SET status = 'matched' WHERE donation_id = $1`,
        [availableDonationId],
      );

      const result = await service.getFMDonations(fmId1, fmRepId1);

      expect(result[0].relevantDonationItems).toEqual([]);
    });

    it('correctly sums allocatedQuantity across multiple pending orders for the same item', async () => {
      await testDataSource.query(
        `UPDATE public.donations SET status = 'matched' WHERE donation_id = $1`,
        [matchingDonationId],
      );

      const almondMilkItemId = (
        await testDataSource.query(
          `SELECT item_id FROM public.donation_items WHERE item_name = 'Almond Milk' ORDER BY item_id DESC LIMIT 1`,
        )
      )[0].item_id;

      const requestId = (
        await testDataSource.query(
          `SELECT request_id FROM public.food_requests 
          WHERE additional_information LIKE '%breakfast items%' LIMIT 1`,
        )
      )[0].request_id;

      const newOrder = await testDataSource.query(
        `INSERT INTO public.orders (request_id, food_manufacturer_id, status, created_at, assignee_id)
        VALUES ($1, $2, 'pending', NOW(), 1) RETURNING order_id`,
        [requestId, fmId2],
      );

      await testDataSource.query(
        `INSERT INTO public.allocations (order_id, item_id, allocated_quantity)
        VALUES ($1, $2, 5)`,
        [newOrder[0].order_id, almondMilkItemId],
      );

      const result = await service.getFMDonations(fmId2, fmRepId2);

      const almond = result[0].relevantDonationItems.find(
        (i) => i.itemName === 'Almond Milk',
      );
      expect(almond?.allocatedQuantity).toBe(15); // 10 + 5
    });
  });
});
