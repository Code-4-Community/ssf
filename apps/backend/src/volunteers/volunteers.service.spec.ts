import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { VolunteersService } from './volunteers.service';
import { Pantry } from '../pantries/pantries.entity';
import { testDataSource } from '../config/typeormTestDataSource';
import { UsersService } from '../users/users.service';
import { PantriesService } from '../pantries/pantries.service';

jest.setTimeout(60000);

describe('VolunteersService', () => {
  let service: VolunteersService;

  beforeAll(async () => {
    // Initialize DataSource once
    if (!testDataSource.isInitialized) {
      await testDataSource.initialize();
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VolunteersService,
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

    service = module.get<VolunteersService>(VolunteersService);
  });

  beforeEach(async () => {
    await testDataSource.query(`DROP SCHEMA IF EXISTS public CASCADE`);
    await testDataSource.query(`CREATE SCHEMA public`);
    await testDataSource.runMigrations();
  });

  afterEach(async () => {
    await testDataSource.query(`DROP SCHEMA public CASCADE`);
  });

  afterAll(async () => {
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
    });
  });

  describe('getVolunteersAndPantryAssignments', () => {
    it('returns an empty array when there are no volunteers', async () => {
      // Delete all users with role 'volunteer' (CASCADE will handle related data)
      await testDataSource.query(
        `DELETE FROM "users" WHERE role = 'volunteer'`,
      );

      const result = await service.getVolunteersAndPantryAssignments();

      expect(result).toEqual([]);
    });

    it('returns all volunteers with their pantry assignments', async () => {
      const result = await service.getVolunteersAndPantryAssignments();

      expect(result.length).toEqual(4);
      expect(result).toEqual([
        {
          id: 6,
          firstName: 'James',
          lastName: 'Thomas',
          email: 'james.t@volunteer.org',
          phone: '555-040-0401',
          role: 'volunteer',
          userCognitoSub: '',
          pantryIds: [1],
        },
        {
          id: 7,
          firstName: 'Maria',
          lastName: 'Garcia',
          email: 'maria.g@volunteer.org',
          phone: '555-040-0402',
          role: 'volunteer',
          userCognitoSub: '',
          pantryIds: [2, 3],
        },
        {
          id: 8,
          firstName: 'William',
          lastName: 'Moore',
          email: 'william.m@volunteer.org',
          phone: '555-040-0403',
          role: 'volunteer',
          userCognitoSub: '',
          pantryIds: [3],
        },
        {
          id: 9,
          firstName: 'Patricia',
          lastName: 'Jackson',
          email: 'patricia.j@volunteer.org',
          phone: '555-040-0404',
          role: 'volunteer',
          userCognitoSub: '',
          pantryIds: [1],
        },
      ]);
    });
  });

  describe('getVolunteerPantries', () => {
    it('returns an empty array when volunteer has no pantry assignments', async () => {
      await testDataSource.query(
        `DELETE FROM "volunteer_assignments" WHERE volunteer_id = 6`,
      );

      const result = await service.getVolunteerPantries(6);

      expect(result).toEqual([]);
    });

    it('returns all pantries assigned to a volunteer', async () => {
      const result = await service.getVolunteerPantries(7);

      expect(result).toHaveLength(2);

      const pantryIds = result.map((p) => p.pantryId);
      expect(pantryIds).toEqual([2, 3]);
    });
  });

  describe('assignPantriesToVolunteer', () => {
    it('assigns new pantries to a volunteer with existing assignments', async () => {
      const beforeAssignment = await service.getVolunteerPantries(7);
      expect(beforeAssignment).toHaveLength(2);
      const beforePantryIds = beforeAssignment.map((p) => p.pantryId);
      expect(beforePantryIds).toEqual([2, 3]);

      const result = await service.assignPantriesToVolunteer(7, [1, 4]);
      expect(result.pantries).toHaveLength(4);
      const afterPantryIds = result.pantries.map((p) => p.pantryId);
      expect(afterPantryIds).toEqual([2, 3, 1, 4]);
    });

    it('assigns pantries to a volunteer with no existing assignments', async () => {
      await testDataSource.query(
        `DELETE FROM "volunteer_assignments" WHERE volunteer_id = 6`,
      );

      const beforeAssignment = await service.getVolunteerPantries(6);
      expect(beforeAssignment).toEqual([]);

      const result = await service.assignPantriesToVolunteer(6, [2, 3]);
      expect(result.pantries).toHaveLength(2);
      const pantryIds = result.pantries.map((p) => p.pantryId);
      expect(pantryIds).toEqual([2, 3]);
    });
  });
});
