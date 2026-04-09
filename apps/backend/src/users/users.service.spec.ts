import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from './users.entity';
import { Role } from './types';
import { mock } from 'jest-mock-extended';
import { AuthService } from '../auth/auth.service';
import { EmailsService } from '../emails/email.service';
import { emailTemplates } from '../emails/emailTemplates';
import { testDataSource } from '../config/typeormTestDataSource';
import { FoodRequest } from '../foodRequests/request.entity';
import { Order } from '../orders/order.entity';
import { Donation } from '../donations/donations.entity';
import { RequestsService } from '../foodRequests/request.service';
import { OrdersService } from '../orders/order.service';
import { DonationService } from '../donations/donations.service';
import { RecurrenceEnum } from '../donations/types';
import { CreateDonationDto } from '../donations/dtos/create-donation.dto';
import { Pantry } from '../pantries/pantries.entity';
import { FoodManufacturer } from '../foodManufacturers/manufacturers.entity';
import { DonationItem } from '../donationItems/donationItems.entity';
import { Allocation } from '../allocations/allocations.entity';
import { DataSource } from 'typeorm';
import { FoodManufacturersService } from '../foodManufacturers/manufacturers.service';
import { DonationItemsService } from '../donationItems/donationItems.service';
import { AllocationsService } from '../allocations/allocations.service';

jest.setTimeout(60000);

const mockAuthService = {
  adminCreateUser: jest.fn().mockResolvedValue('mock-sub'),
};
const mockEmailsService = mock<EmailsService>();

describe('UsersService', () => {
  let service: UsersService;
  let foodRequestService: RequestsService;
  let donationService: DonationService;

  beforeAll(async () => {
    process.env.SEND_AUTOMATED_EMAILS = 'true';
    mockEmailsService.sendEmails.mockResolvedValue(undefined);

    if (!testDataSource.isInitialized) {
      await testDataSource.initialize();
    }
    await testDataSource.query(`DROP SCHEMA IF EXISTS public CASCADE`);
    await testDataSource.query(`CREATE SCHEMA public`);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        RequestsService,
        OrdersService,
        DonationService,
        FoodManufacturersService,
        DonationItemsService,
        AllocationsService,
        {
          provide: AuthService,
          useValue: mockAuthService,
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
          provide: getRepositoryToken(FoodRequest),
          useValue: testDataSource.getRepository(FoodRequest),
        },
        {
          provide: getRepositoryToken(Order),
          useValue: testDataSource.getRepository(Order),
        },
        {
          provide: getRepositoryToken(Donation),
          useValue: testDataSource.getRepository(Donation),
        },
        {
          provide: getRepositoryToken(FoodManufacturer),
          useValue: testDataSource.getRepository(FoodManufacturer),
        },
        {
          provide: getRepositoryToken(DonationItem),
          useValue: testDataSource.getRepository(DonationItem),
        },
        {
          provide: getRepositoryToken(Allocation),
          useValue: testDataSource.getRepository(Allocation),
        },
        {
          provide: DataSource,
          useValue: testDataSource,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    foodRequestService = module.get<RequestsService>(RequestsService);
    donationService = module.get<DonationService>(DonationService);
  });

  beforeEach(async () => {
    mockAuthService.adminCreateUser.mockClear();
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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should send email, create cognito user, and save to DB for volunteer', async () => {
      const createUserDto = {
        email: 'newvolunteer@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        phone: '9876543210',
        role: Role.VOLUNTEER,
      };

      const result = await service.create(createUserDto);

      const { subject, bodyHTML } = emailTemplates.volunteerAccountCreated();
      expect(mockEmailsService.sendEmails).toHaveBeenCalledTimes(1);
      expect(mockEmailsService.sendEmails).toHaveBeenCalledWith(
        [createUserDto.email],
        subject,
        bodyHTML,
      );
      expect(mockAuthService.adminCreateUser).toHaveBeenCalledWith({
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        email: createUserDto.email,
      });
      expect(result.id).toBeDefined();
      expect(result.userCognitoSub).toBe('mock-sub');

      const saved = await testDataSource
        .getRepository(User)
        .findOneBy({ email: createUserDto.email });
      expect(saved).toBeDefined();
      expect(saved?.userCognitoSub).toBe('mock-sub');
    });

    it('should save to cognito and DB but throw if email fails', async () => {
      const createUserDto = {
        email: 'newvolunteer2@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        phone: '9876543210',
        role: Role.VOLUNTEER,
      };
      mockEmailsService.sendEmails.mockRejectedValueOnce(
        new Error('Email failed'),
      );

      await expect(service.create(createUserDto)).rejects.toThrow(
        new InternalServerErrorException(
          'Failed to send account created notification email to volunteer',
        ),
      );

      expect(mockAuthService.adminCreateUser).toHaveBeenCalledTimes(1);

      const saved = await testDataSource
        .getRepository(User)
        .findOneBy({ email: createUserDto.email });
      expect(saved).toBeDefined();
      expect(saved?.userCognitoSub).toBe('mock-sub');
    });

    it('should not save to DB or send email if cognito creation fails', async () => {
      const createUserDto = {
        email: 'newvolunteer3@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        phone: '9876543210',
        role: Role.VOLUNTEER,
      };
      mockAuthService.adminCreateUser.mockRejectedValueOnce(
        new Error('Cognito failed'),
      );

      await expect(service.create(createUserDto)).rejects.toThrow();

      expect(mockEmailsService.sendEmails).not.toHaveBeenCalled();

      const saved = await testDataSource
        .getRepository(User)
        .findOneBy({ email: createUserDto.email });
      expect(saved).toBeNull();
    });

    it('should create a new user with auto-generated ID for admin (no email sent)', async () => {
      const createUserDto = {
        email: 'newadmin@example.com',
        firstName: 'New',
        lastName: 'Admin',
        phone: '1112223333',
        role: Role.ADMIN,
      };

      const result = await service.create(createUserDto);

      expect(result.id).toBeDefined();
      expect(result.email).toBe(createUserDto.email);
      expect(result.firstName).toBe(createUserDto.firstName);
      expect(result.userCognitoSub).toBe('mock-sub');
      expect(mockAuthService.adminCreateUser).toHaveBeenCalledWith({
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        email: createUserDto.email,
      });
      expect(mockEmailsService.sendEmails).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const user = await service.findOne(1);

      expect(user).toBeDefined();
      expect(user.id).toBe(1);
    });

    it('should throw NotFoundException when user is not found', async () => {
      await expect(service.findOne(9999)).rejects.toThrow(
        new NotFoundException('User 9999 not found'),
      );
    });

    it('should throw error for invalid id', async () => {
      await expect(service.findOne(-1)).rejects.toThrow(
        new BadRequestException('Invalid User ID'),
      );
    });
  });

  describe('update', () => {
    it('should update user attributes', async () => {
      const result = await service.update(1, { firstName: 'Updated' });

      expect(result.firstName).toBe('Updated');
      expect(result.lastName).toBe('Smith');

      const fromDb = await testDataSource
        .getRepository(User)
        .findOneBy({ id: 1 });
      expect(fromDb?.firstName).toBe('Updated');
    });

    it('should throw NotFoundException when user is not found', async () => {
      await expect(
        service.update(9999, { firstName: 'Updated' }),
      ).rejects.toThrow(new NotFoundException('User 9999 not found'));
    });

    it('should throw error for invalid id', async () => {
      await expect(
        service.update(-1, { firstName: 'Updated' }),
      ).rejects.toThrow(new BadRequestException('Invalid User ID'));
    });
  });

  describe('remove', () => {
    it('should remove a user by id', async () => {
      await testDataSource.query(
        `DELETE FROM allocations WHERE order_id IN (SELECT order_id FROM orders WHERE assignee_id = 6)`,
      );
      await testDataSource.query(`DELETE FROM orders WHERE assignee_id = 6`);

      const result = await service.remove(6);

      expect(result.email).toBe('james.t@volunteer.org');

      const fromDb = await testDataSource
        .getRepository(User)
        .findOneBy({ id: 6 });
      expect(fromDb).toBeNull();
    });

    it('should throw NotFoundException when user is not found', async () => {
      await expect(service.remove(9999)).rejects.toThrow(
        new NotFoundException('User 9999 not found'),
      );
    });

    it('should throw error for invalid id', async () => {
      await expect(service.remove(-1)).rejects.toThrow(
        new BadRequestException('Invalid User ID'),
      );
    });
  });

  describe('findUsersByRoles', () => {
    it('should return users by roles', async () => {
      const result = await service.findUsersByRoles([Role.ADMIN]);

      expect(result.length).toBe(2);
      expect(result.every((u) => u.role === Role.ADMIN)).toBe(true);
    });

    it('should return empty array when no users found', async () => {
      await testDataSource.query(
        `DELETE FROM public.users WHERE role = 'admin'`,
      );

      const result = await service.findUsersByRoles([Role.ADMIN]);

      expect(result).toEqual([]);
    });
  });

  describe('getMonthlyAggregatedStats', () => {
    it('should return correct aggregated counts for the current month', async () => {
      const foodRequestRepo = testDataSource.getRepository(FoodRequest);

      const now = new Date();

      const createDonationBody: Partial<CreateDonationDto> = {
        foodManufacturerId: 1,
        recurrence: RecurrenceEnum.MONTHLY,
        recurrenceFreq: 3,
        occurrencesRemaining: 2,
      };

      await donationService.create(createDonationBody as CreateDonationDto);

      // updating existing request to have a current month requested at date
      const existingRequest = await foodRequestService.findOne(1);
      existingRequest.requestedAt = new Date(
        now.getFullYear(),
        now.getMonth(),
        5,
      );
      await foodRequestRepo.save(existingRequest);

      const stats = await service.getMonthlyAggregatedStats();

      const expectedKeys = [
        'Food Requests',
        'Orders',
        'Donations',
        'Volunteers',
      ];

      expect(Object.keys(stats)).toEqual(expectedKeys);

      Object.values(stats).forEach((value) => {
        expect(typeof value).toBe('string');
      });

      expect(stats).toEqual({
        'Food Requests': '1',
        Orders: '0',
        Donations: '1',
        Volunteers: '4',
      });
    });

    it('should return correct aggregated counts for the current month with edge cases of start and end of month', async () => {
      const foodRequestRepo = testDataSource.getRepository(FoodRequest);

      const now = new Date();

      const year = now.getFullYear();
      const month = now.getMonth();

      const startOfMonth = new Date(year, month, 1, 0, 0, 0, 0);

      const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);

      const existingRequest1 = await foodRequestService.findOne(1);
      existingRequest1.requestedAt = endOfMonth;
      await foodRequestRepo.save(existingRequest1);

      const existingRequest2 = await foodRequestService.findOne(2);
      existingRequest2.requestedAt = startOfMonth;
      await foodRequestRepo.save(existingRequest2);

      const stats = await service.getMonthlyAggregatedStats();

      const expectedKeys = [
        'Food Requests',
        'Orders',
        'Donations',
        'Volunteers',
      ];

      expect(Object.keys(stats)).toEqual(expectedKeys);

      Object.values(stats).forEach((value) => {
        expect(typeof value).toBe('string');
      });

      expect(stats).toEqual({
        'Food Requests': '2',
        Orders: '0',
        Donations: '0',
        Volunteers: '4',
      });
    });

    it('should return just volunteer count if no other fields are relative to current month', async () => {
      const stats = await service.getMonthlyAggregatedStats();

      const expectedKeys = [
        'Food Requests',
        'Orders',
        'Donations',
        'Volunteers',
      ];

      expect(Object.keys(stats)).toEqual(expectedKeys);

      Object.values(stats).forEach((value) => {
        expect(typeof value).toBe('string');
      });

      expect(stats).toEqual({
        'Food Requests': '0',
        Orders: '0',
        Donations: '0',
        Volunteers: '4',
      });
    });

    it('should return correct aggregated counts for mixed month dataset', async () => {
      const foodRequestRepo = testDataSource.getRepository(FoodRequest);

      const now = new Date();

      const year = now.getFullYear();
      const month = now.getMonth();

      const startOfCurrentMonth = new Date(year, month, 1, 0, 0, 0, 0);

      const endOfNextMonth = new Date(year, month + 2, 0, 23, 59, 59, 999);

      const existingRequest1 = await foodRequestService.findOne(1);
      existingRequest1.requestedAt = endOfNextMonth;
      await foodRequestRepo.save(existingRequest1);

      const existingRequest2 = await foodRequestService.findOne(2);
      existingRequest2.requestedAt = startOfCurrentMonth;
      await foodRequestRepo.save(existingRequest2);

      const stats = await service.getMonthlyAggregatedStats();

      const expectedKeys = [
        'Food Requests',
        'Orders',
        'Donations',
        'Volunteers',
      ];

      expect(Object.keys(stats)).toEqual(expectedKeys);

      Object.values(stats).forEach((value) => {
        expect(typeof value).toBe('string');
      });

      expect(stats).toEqual({
        'Food Requests': '1',
        Orders: '0',
        Donations: '0',
        Volunteers: '4',
      });
    });
  });

  describe('findByIds', () => {
    it('findByIds success', async () => {
      const found = await service.findByIds([1, 2]);
      expect(found.map((u) => u.id)).toEqual([1, 2]);
    });

    it('findByIds with some non-existent IDs throws NotFoundException', async () => {
      await expect(service.findByIds([1, 9999])).rejects.toThrow(
        new NotFoundException('Users not found: 9999'),
      );
    });
  });
});
