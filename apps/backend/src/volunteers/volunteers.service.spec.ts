import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { VolunteersService } from './volunteers.service';
import { Pantry } from '../pantries/pantries.entity';
import { testDataSource } from '../config/typeormTestDataSource';

jest.setTimeout(60000);

describe('VolunteersService', () => {
  let service: VolunteersService;

  beforeAll(async () => {
    // Initialize DataSource once
    if (!testDataSource.isInitialized) {
      await testDataSource.initialize();
    }

    // Clean database at the start
    await testDataSource.query(`DROP SCHEMA public CASCADE`);
    await testDataSource.query(`CREATE SCHEMA public`);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VolunteersService,
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

    service = module.get<VolunteersService>(VolunteersService);
  });

  beforeEach(async () => {
    // Run all migrations fresh for each test
    await testDataSource.runMigrations();
  });

  afterEach(async () => {
    // Drop the schema completely (cascades all tables)
    await testDataSource.query(`DROP SCHEMA public CASCADE`);
    await testDataSource.query(`CREATE SCHEMA public`);
  });

  afterAll(async () => {
    // Destroy all schemas
    if (testDataSource.isInitialized) {
      await testDataSource.destroy();
    }
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should return a volunteer by id', async () => {
      const volunteerId = 6;
      const result = await service.findOne(volunteerId);

      expect(result).toBeDefined();
      expect(result.id).toBe(6);
    });

    it('should throw NotFoundException when volunteer is not found', async () => {
      await expect(service.findOne(999)).rejects.toThrow(
        new NotFoundException('Volunteer 999 not found'),
      );
    });

    it('should throw a NotFoundException when a non-volunteer is found', async () => {
      await expect(service.findOne(1)).rejects.toThrow(
        new NotFoundException('User 1 is not a volunteer'),
      );
    })
  });
});
