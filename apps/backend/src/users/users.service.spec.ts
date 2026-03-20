import { NotFoundException, BadRequestException } from '@nestjs/common';
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

jest.setTimeout(60000);

const mockAuthService = {
  adminCreateUser: jest.fn().mockResolvedValue('mock-sub'),
};
const mockEmailsService = mock<EmailsService>();

describe('UsersService', () => {
  let service: UsersService;

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
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: EmailsService,
          useValue: mockEmailsService,
        },
        {
          provide: getRepositoryToken(User),
          useValue: testDataSource.getRepository(User),
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
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
    it('should send a welcome email when creating a volunteer', async () => {
      const createUserDto = {
        email: 'newvolunteer@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        phone: '9876543210',
        role: Role.VOLUNTEER,
      };

      await service.create(createUserDto);

      const { subject, bodyHTML } = emailTemplates.volunteerAccountCreated();
      expect(mockEmailsService.sendEmails).toHaveBeenCalledTimes(1);
      expect(mockEmailsService.sendEmails).toHaveBeenCalledWith(
        [createUserDto.email],
        subject,
        bodyHTML,
      );
    });

    it('should still save user to database if email send fails', async () => {
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
        'Email failed',
      );

      const saved = await testDataSource
        .getRepository(User)
        .findOneBy({ email: createUserDto.email });
      expect(saved).toBeDefined();
      expect(saved?.firstName).toBe('Jane');
    });

    it('should create a new user with auto-generated ID', async () => {
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
});
