import { BadRequestException } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { Role } from './types';
import { userSchemaDto } from './dtos/userSchema.dto';

import { Test, TestingModule } from '@nestjs/testing';
import { mock } from 'jest-mock-extended';
import { Pantry } from '../pantries/pantries.entity';

const mockUserService = mock<UsersService>();

const mockUser1: Partial<User> = {
  id: 1,
  email: 'john@example.com',
  firstName: 'John',
  lastName: 'Doe',
  phone: '1234567890',
  role: Role.VOLUNTEER,
};

const mockUser2: Partial<User> = {
  id: 2543210,
  email: 'bobsmith@example.com',
  firstName: 'Bob',
  lastName: 'Smith',
  phone: '9876',
  role: Role.VOLUNTEER,
};

const mockUser3: Partial<User> = {
  id: 3,
  role: Role.VOLUNTEER,
};

const mockPantries: Partial<Pantry>[] = [
  {
    pantryId: 1,
    pantryUser: mockUser1 as User,
  },
  {
    pantryId: 2,
    pantryUser: mockUser1 as User,
  },
  {
    pantryId: 3,
    pantryUser: mockUser2 as User,
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

  describe('GET /volunteers', () => {
    it('should return all volunteers', async () => {
      const volunteers: Partial<User>[] = [
        {
          id: 1,
          role: Role.VOLUNTEER,
          pantries: [{ pantryId: 1 }] as Pantry[],
        },
        {
          id: 2,
          role: Role.VOLUNTEER,
          pantries: [{ pantryId: 2 }] as Pantry[],
        },
      ];

      mockUserService.getVolunteersAndPantryAssignments.mockResolvedValue(volunteers as (Omit<User, 'pantries'> & { pantryIds: number[] })[],);

      const result = await controller.getAllVolunteers();

      expect(result).toEqual(volunteers);
      expect(result.some((u) => u.role === Role.ADMIN)).toBe(false);
      expect(mockUserService.getVolunteersAndPantryAssignments).toHaveBeenCalled();
    });
  });

  describe('GET /:id', () => {
    it('should return a user by id', async () => {
      mockUserService.findOne.mockResolvedValue(mockUser1 as User);

      const result = await controller.getUser(1);

      expect(result).toEqual(mockUser1);
      expect(mockUserService.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('DELETE /:id', () => {
    it('should remove a user by id', async () => {
      mockUserService.remove.mockResolvedValue(mockUser1 as User);

      const result = await controller.removeUser(1);

      expect(result).toEqual(mockUser1);
      expect(mockUserService.remove).toHaveBeenCalledWith(1);
    });
  });

  describe('PUT /:id/role', () => {
    it('should update user role with valid role', async () => {
      const updatedUser = { ...mockUser1, role: Role.ADMIN };
      mockUserService.update.mockResolvedValue(updatedUser as User);

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

      const createdUser = { ...createUserSchema, id: 2 } as User;
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
        role: Role.VOLUNTEER,
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
      const assignments: (User & { pantryIds: number[] })[] = [
        { ...(mockUser1 as User), pantryIds: [1, 2] },
        { ...(mockUser2 as User), pantryIds: [1] },
        { ...(mockUser3 as User), pantryIds: [] },
      ];

      mockUserService.getVolunteersAndPantryAssignments.mockResolvedValue(
        assignments,
      );

      const result = await controller.getAllVolunteers();

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
        mockPantries.slice(0, 2) as Pantry[],
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
      const updatedUser = {
        ...mockUser3,
        pantries: [mockPantries[0] as Pantry, mockPantries[2] as Pantry],
      } as User;

      mockUserService.assignPantriesToVolunteer.mockResolvedValue(updatedUser);

      const result = await controller.assignPantries(3, pantryIds);

      expect(result).toEqual(updatedUser);
      expect(result.pantries).toHaveLength(2);
      expect(result.pantries[0].pantryId).toBe(1);
      expect(result.pantries[1].pantryId).toBe(3);
      expect(mockUserService.assignPantriesToVolunteer).toHaveBeenCalledWith(
        3,
        pantryIds,
      );
    });
  });
});
