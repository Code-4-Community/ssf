import { BadRequestException } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { Role } from './types';
import { userSchema } from './users.controller';

import { Test, TestingModule } from '@nestjs/testing';
import { mock } from 'jest-mock-extended';

const mockUserService = mock<UsersService>();

describe('UsersController', () => {
  let controller: UsersController;

  const mockUser1: User = {
    id: 1,
    email: 'john@example.com',
    firstName: 'John',
    lastName: 'Doe',
    phone: '1234567890',
    role: Role.STANDARD_VOLUNTEER,
  };

  const mockUser2: User = {
    id: 2,
    email: 'jane@example.com',
    firstName: 'Jane',
    lastName: 'Smith',
    phone: '2002002000',
    role: Role.ADMIN,
  };

  const mockUsersService = {
    findUsersByRoles: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    update: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllVolunteers', () => {
    it('should return all volunteers', async () => {
      const volunteers = [mockUser1, mockUser2];
      mockUsersService.findUsersByRoles.mockResolvedValue(volunteers);

      const result = await controller.getAllVolunteers();

      expect(result).toEqual(volunteers);
      expect(mockUsersService.findUsersByRoles).toHaveBeenCalledWith([
        Role.LEAD_VOLUNTEER,
        Role.STANDARD_VOLUNTEER,
      ]);
    });
  });

  describe('getUser', () => {
    it('should return a user by id', async () => {
      mockUsersService.findOne.mockResolvedValue(mockUser1);

      const result = await controller.getUser(1);

      expect(result).toEqual(mockUser1);
      expect(mockUsersService.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('removeUser', () => {
    it('should remove a user by id', async () => {
      mockUsersService.remove.mockResolvedValue(mockUser1);

      const result = await controller.removeUser(1);

      expect(result).toEqual(mockUser1);
      expect(mockUsersService.remove).toHaveBeenCalledWith(1);
    });
  });

  describe('updateRole', () => {
    it('should update user role with valid role', async () => {
      const updatedUser = { ...mockUser1, role: Role.ADMIN };
      mockUsersService.update.mockResolvedValue(updatedUser);

      const result = await controller.updateRole(1, Role.ADMIN);

      expect(result).toEqual(updatedUser);
      expect(mockUsersService.update).toHaveBeenCalledWith(1, {
        role: Role.ADMIN,
      });
    });

    it('should throw BadRequestException for invalid role', async () => {
      await expect(controller.updateRole(1, 'invalid_role')).rejects.toThrow(
        BadRequestException,
      );
      expect(mockUsersService.update).not.toHaveBeenCalled();
    });
  });

  describe('createUser', () => {
    it('should create a new user with all required fields', async () => {
      const createUserSchema: userSchema = {
        email: 'newuser@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        phone: '9876543210',
        role: Role.ADMIN,
      };

      const createdUser = { ...createUserSchema, id: 2 };
      mockUsersService.create.mockResolvedValue(createdUser);

      const result = await controller.createUser(createUserSchema);

      expect(result).toEqual(createdUser);
      expect(mockUsersService.create).toHaveBeenCalledWith(
        createUserSchema.email,
        createUserSchema.firstName,
        createUserSchema.lastName,
        createUserSchema.phone,
        createUserSchema.role,
      );
    });

    it('should create a new user with default role when role is not provided', async () => {
      const createUserSchema: userSchema = {
        email: 'newuser@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        phone: '9876543210',
      };

      const createdUser = {
        ...createUserSchema,
        id: 2,
        role: Role.STANDARD_VOLUNTEER,
      };
      mockUsersService.create.mockResolvedValue(createdUser);

      const result = await controller.createUser(createUserSchema);

      expect(result).toEqual(createdUser);
      expect(mockUsersService.create).toHaveBeenCalledWith(
        createUserSchema.email,
        createUserSchema.firstName,
        createUserSchema.lastName,
        createUserSchema.phone,
        undefined, // role should be undefined when not provided
      );
    });

    it('should handle service errors', async () => {
      const createUserSchema: userSchema = {
        email: 'newuser@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        phone: '9876543210',
      };

      const error = new Error('Database error');
      mockUsersService.create.mockRejectedValue(error);

      await expect(controller.createUser(createUserSchema)).rejects.toThrow(
        error,
      );
    });
  });
});
