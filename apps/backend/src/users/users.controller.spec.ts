import { BadRequestException } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { Role } from './types';
import { userSchemaDto } from './dto/userSchema.dto';

import { Test, TestingModule } from '@nestjs/testing';
import { mock } from 'jest-mock-extended';

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
      const volunteers = [mockUser1, mockUser2];
      mockUserService.findUsersByRoles.mockResolvedValue(volunteers);

      const result = await controller.getAllVolunteers();

      const hasAdmin = result.some((user) => user.role === Role.ADMIN);
      expect(hasAdmin).toBe(false);

      expect(result).toEqual(volunteers);
      expect(mockUserService.findUsersByRoles).toHaveBeenCalledWith([
        Role.LEAD_VOLUNTEER,
        Role.STANDARD_VOLUNTEER,
      ]);
    });
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
});
