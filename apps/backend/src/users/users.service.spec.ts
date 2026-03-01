import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { Role } from './types';
import { testDataSource } from '../config/typeormTestDataSource';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { PantriesService } from '../pantries/pantries.service';
import { Pantry } from '../pantries/pantries.entity';

jest.setTimeout(60000);

describe('UsersService', () => {
  let service: UsersService;

  beforeAll(async () => {
    if (!testDataSource.isInitialized) {
      await testDataSource.initialize();
    }

    await testDataSource.query(`DROP SCHEMA IF EXISTS public CASCADE`);
    await testDataSource.query(`CREATE SCHEMA public`);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        PantriesService,
        {
          provide: getRepositoryToken(User),
          useValue: testDataSource.getRepository(User),
        },
        {
          provide: getRepositoryToken(Pantry),
          useValue: testDataSource.getRepository(Pantry),
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  beforeEach(async () => {
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
    it('should create a new user with auto-generated ID', async () => {
      const result = await service.create(
        'newuser@example.com',
        'Jane',
        'Smith',
        '9876543210',
        Role.ADMIN,
      );

      expect(result).toMatchObject({
        email: 'newuser@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        phone: '9876543210',
        role: Role.ADMIN,
      });
      expect(result.id).toBeDefined();
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const created = await service.create(
        'find@example.com',
        'John',
        'Doe',
        '1234567890',
        Role.VOLUNTEER,
      );

      const result = await service.findOne(created.id);
      expect(result).toMatchObject({
        id: created.id,
        email: 'find@example.com',
      });
    });

    it('should throw NotFoundException when user is not found', async () => {
      await expect(service.findOne(999)).rejects.toThrow(
        new NotFoundException('User 999 not found'),
      );
    });

    it('should throw error for invalid id', async () => {
      await expect(service.findOne(-1)).rejects.toThrow(
        new BadRequestException('Invalid User ID'),
      );
    });
  });

  describe('findByEmail', () => {
    it('should return user by email', async () => {
      await service.create(
        'email@example.com',
        'Jane',
        'Doe',
        '1111111111',
        Role.PANTRY,
      );

      const result = await service.findByEmail('email@example.com');
      expect(result).toMatchObject({ email: 'email@example.com' });
    });
  });

  describe('update', () => {
    let testUser: User;

    beforeEach(async () => {
      testUser = await service.create(
        'update@example.com',
        'John',
        'Doe',
        '1234567890',
        Role.VOLUNTEER,
      );
    });

    it('should update firstName', async () => {
      const result = await service.update(testUser.id, {
        firstName: 'Updated',
      });

      expect(result.firstName).toBe('Updated');
      expect(result.lastName).toBe(testUser.lastName);
    });

    it('should update lastName', async () => {
      const result = await service.update(testUser.id, { lastName: 'Smith' });

      expect(result.lastName).toBe('Smith');
    });

    it('should update phone', async () => {
      const result = await service.update(testUser.id, { phone: '0987654321' });

      expect(result.phone).toBe('0987654321');
    });

    it('should update multiple fields at once', async () => {
      const result = await service.update(testUser.id, {
        firstName: 'Updated',
        lastName: 'Smith',
      });

      expect(result.firstName).toBe('Updated');
      expect(result.lastName).toBe('Smith');
    });

    it('should not overwrite fields absent from the DTO', async () => {
      const result = await service.update(testUser.id, {
        firstName: 'OnlyFirst',
      });

      expect(result.firstName).toBe('OnlyFirst');
      expect(result.lastName).toBe(testUser.lastName);
      expect(result.email).toBe(testUser.email);
      expect(result.phone).toBe(testUser.phone);
      expect(result.role).toBe(testUser.role);
    });

    it('should throw BadRequestException when DTO is empty', async () => {
      await expect(service.update(testUser.id, {})).rejects.toThrow(
        new BadRequestException(
          'At least one field must be provided to update',
        ),
      );
    });

    it('should throw NotFoundException when user is not found', async () => {
      await expect(
        service.update(999, { firstName: 'Updated' }),
      ).rejects.toThrow(new NotFoundException('User 999 not found'));
    });

    it('should throw BadRequestException for invalid id', async () => {
      await expect(
        service.update(-1, { firstName: 'Updated' }),
      ).rejects.toThrow(new BadRequestException('Invalid User ID'));
    });
  });

  describe('remove', () => {
    it('should remove a user by id', async () => {
      const created = await service.create(
        'remove@example.com',
        'John',
        'Doe',
        '1234567890',
        Role.VOLUNTEER,
      );

      await service.remove(created.id);
      await expect(service.findOne(created.id)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when user is not found', async () => {
      await expect(service.remove(999)).rejects.toThrow(
        new NotFoundException('User 999 not found'),
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
      const created = await service.create(
        'vol@example.com',
        'Vol',
        'User',
        '2222222222',
        Role.VOLUNTEER,
      );

      const result = await service.findUsersByRoles([Role.VOLUNTEER]);

      expect(result.some((u) => u.id === created.id)).toBe(true);
      expect(result.every((u) => u.role === Role.VOLUNTEER)).toBe(true);
    });

    it('should return empty array when no users match roles', async () => {
      await testDataSource.query(`DELETE FROM "allocations"`);
      await testDataSource.query(`DELETE FROM "orders"`);
      await testDataSource.query(`DELETE FROM "food_requests"`);
      await testDataSource.query(`DELETE FROM "pantries"`);
      await testDataSource.query(`DELETE FROM "users" WHERE role = 'pantry'`);

      const result = await service.findUsersByRoles([Role.PANTRY]);
      expect(result).toEqual([]);
    });
  });
});
