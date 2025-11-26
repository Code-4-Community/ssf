import { BadRequestException } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { Role } from './types';
import { userSchemaDto } from './dtos/userSchema.dto';

import { Test, TestingModule } from '@nestjs/testing';
import { mock } from 'jest-mock-extended';
import { Pantry } from '../pantries/pantries.entity';
import {
  Activity,
  PantryStatus,
  RefrigeratedDonation,
} from '../pantries/types';

const mockUserService = mock<UsersService>();

const mockUser1: User = {
  id: 1,
  email: 'john@example.com',
  firstName: 'John',
  lastName: 'Doe',
  phone: '1234567890',
  role: Role.STANDARD_VOLUNTEER,
};

const mockUser2: User = {
  id: 2543210,
  email: 'bobsmith@example.com',
  firstName: 'Bob',
  lastName: 'Smith',
  phone: '9876',
  role: Role.LEAD_VOLUNTEER,
};

const mockUser3: User = {
  id: 3,
  email: 'test@test.com',
  firstName: 'Test',
  lastName: 'User',
  phone: '5555555555',
  role: Role.STANDARD_VOLUNTEER,
};

const mockPantries: Pantry[] = [
  {
    pantryId: 1,
    pantryName: 'Pantry A',
    addressLine1: '123 Main St',
    addressCity: 'City',
    addressState: 'State',
    addressZip: '12345',
    allergenClients: 'Daily',
    refrigeratedDonation: RefrigeratedDonation.NO,
    reserveFoodForAllergic: 'Yes',
    dedicatedAllergyFriendly: false,
    newsletterSubscription: false,
    restrictions: ['Egg allergy'],
    pantryUser: mockUser1,
    status: PantryStatus.PENDING,
    dateApplied: new Date(),
    activities: [Activity.COLLECT_FEEDBACK, Activity.POST_RESOURCE_FLYERS],
    itemsInStock: 'bread',
    needMoreOptions: 'No',
  },
  {
    pantryId: 2,
    pantryName: 'Pantry B',
    addressLine1: '456 Side St',
    addressCity: 'Town',
    addressState: 'Province',
    addressZip: '67890',
    allergenClients: 'Weekly',
    refrigeratedDonation: RefrigeratedDonation.SOMETIMES,
    reserveFoodForAllergic: 'No',
    dedicatedAllergyFriendly: true,
    newsletterSubscription: true,
    restrictions: ['Milk allergy'],
    pantryUser: mockUser1,
    status: PantryStatus.APPROVED,
    dateApplied: new Date(),
    activities: [Activity.SURVEY_CLIENTS],
    itemsInStock: 'fruits',
    needMoreOptions: 'Yes',
  },
  {
    pantryId: 3,
    pantryName: 'Pantry C',
    addressLine1: 'Address',
    addressCity: 'City',
    addressState: 'State',
    addressZip: '10001',
    allergenClients: 'Weekly',
    refrigeratedDonation: RefrigeratedDonation.YES,
    reserveFoodForAllergic: 'No',
    dedicatedAllergyFriendly: false,
    newsletterSubscription: true,
    restrictions: ['Milk allergy'],
    pantryUser: mockUser2,
    status: PantryStatus.PENDING,
    dateApplied: new Date(),
    activities: [Activity.PROVIDE_EDUCATIONAL_PAMPHLETS],
    itemsInStock: 'fruits',
    needMoreOptions: 'Yes',
  },
];

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    mockUserService.findUsersByRoles.mockReset();
    mockUserService.findOne.mockReset();
    mockUserService.remove.mockReset();
    mockUserService.update.mockReset();
    mockUserService.create.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /:id', () => {
    it('should return a user by id', async () => {
      mockUserService.findOne.mockResolvedValue(mockUser1);

      const result = await controller.getUser(1);

      expect(result).toEqual(mockUser1);
      expect(mockUserService.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('DELETE /:id', () => {
    it('should remove a user by id', async () => {
      mockUserService.remove.mockResolvedValue(mockUser1);

      const result = await controller.removeUser(1);

      expect(result).toEqual(mockUser1);
      expect(mockUserService.remove).toHaveBeenCalledWith(1);
    });
  });

  describe('PUT :id/role', () => {
    it('should update user role with valid role', async () => {
      const updatedUser = { ...mockUser1, role: Role.ADMIN };
      mockUserService.update.mockResolvedValue(updatedUser);

      const result = await controller.updateRole(1, Role.ADMIN);

      expect(result).toEqual(updatedUser);
      expect(mockUserService.update).toHaveBeenCalledWith(1, {
        role: Role.ADMIN,
      });
    });

    it('should throw BadRequestException for invalid role', async () => {
      await expect(controller.updateRole(1, 'invalid_role')).rejects.toThrow(
        BadRequestException,
      );
      expect(mockUserService.update).not.toHaveBeenCalled();
    });
  });

  describe('POST /api/users', () => {
    it('should create a new user with all required fields', async () => {
      const createUserSchema: userSchemaDto = {
        email: 'newuser@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        phone: '9876543210',
        role: Role.ADMIN,
      };

      const createdUser = { ...createUserSchema, id: 2 };
      mockUserService.create.mockResolvedValue(createdUser);

      const result = await controller.createUser(createUserSchema);

      expect(result).toEqual(createdUser);
      expect(mockUserService.create).toHaveBeenCalledWith(
        createUserSchema.email,
        createUserSchema.firstName,
        createUserSchema.lastName,
        createUserSchema.phone,
        createUserSchema.role,
      );
    });

    it('should handle service errors', async () => {
      const createUserSchema: userSchemaDto = {
        email: 'newuser@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        phone: '9876543210',
        role: Role.STANDARD_VOLUNTEER,
      };

      const error = new Error('Database error');
      mockUserService.create.mockRejectedValue(error);

      await expect(controller.createUser(createUserSchema)).rejects.toThrow(
        error,
      );
    });
  });

  describe('GET /volunteers', () => {
    it('should return all volunteers with their pantry assignments', async () => {
      const assignments = [
        { ...mockUser1, pantryIds: [1, 2] },
        { ...mockUser2, pantryIds: [1] },
        { ...mockUser3, pantryIds: [] },
      ];

      mockUserService.getVolunteersAndPantryAssignments.mockResolvedValue(
        assignments,
      );

      const result = await controller.getAllVolunteers();

      const hasAdmin = result.some((user) => user.role === Role.ADMIN);
      expect(hasAdmin).toBe(false);

      expect(result).toEqual(assignments);
      expect(result).toHaveLength(3);
      expect(result[0].id).toBe(1);
      expect(result[0].pantryIds).toEqual([1, 2]);
      expect(result[1].id).toBe(2543210);
      expect(result[1].pantryIds).toEqual([1]);
      expect(result[2].id).toBe(3);
      expect(result[2].pantryIds).toEqual([]);
      expect(
        mockUserService.getVolunteersAndPantryAssignments,
      ).toHaveBeenCalled();
    });
  });

  describe('GET /:id/pantries', () => {
    it('should return pantries assigned to a user', async () => {
      mockUserService.getVolunteerPantries.mockResolvedValue(
        mockPantries.slice(0, 2),
      );

      const result = await controller.getVolunteerPantries(1);

      expect(result).toHaveLength(2);
      expect(result).toEqual(mockPantries.slice(0, 2));
      expect(mockUserService.getVolunteerPantries).toHaveBeenCalledWith(1);
    });
  });

  describe('POST /:id/pantries', () => {
    it('should assign pantries to a volunteer and return result', async () => {
      const pantryIds = [1, 3];
      const mockAssignments = [
        {
          volunteerId: 3,
          pantryId: 1,
          volunteer: mockUser3,
          pantry: mockPantries[0],
        },
        {
          volunteerId: 3,
          pantryId: 3,
          volunteer: mockUser3,
          pantry: mockPantries[2],
        },
      ];
      mockUserService.assignPantriesToVolunteer.mockResolvedValue(
        mockAssignments,
      );

      const result = await controller.assignPantries(3, pantryIds);

      expect(result).toEqual(mockAssignments);
      expect(mockUserService.assignPantriesToVolunteer).toHaveBeenCalledWith(
        3,
        pantryIds,
      );
    });
  });
});
