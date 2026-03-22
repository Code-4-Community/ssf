import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './users.entity';
import { Role } from './types';
import { userSchemaDto } from './dtos/userSchema.dto';
import { Test, TestingModule } from '@nestjs/testing';
import { mock } from 'jest-mock-extended';
import { UpdateUserInfoDto } from './dtos/update-user-info.dto';
import { BadRequestException } from '@nestjs/common';
import { AuthenticatedRequest } from '../auth/authenticated-request';

const mockUserService = mock<UsersService>();

const mockUser1: Partial<User> = {
  id: 1,
  email: 'john@example.com',
  firstName: 'John',
  lastName: 'Doe',
  phone: '1234567890',
  role: Role.VOLUNTEER,
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

  describe('GET /me', () => {
    it('should return the current user', async () => {
      const req = {
        user: {
          id: 1,
        },
      } as AuthenticatedRequest;

      mockUserService.findOne.mockResolvedValueOnce(mockUser1 as User);
      const result = await controller.getCurrentUser(req);

      expect(result).toEqual(mockUser1);
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

  describe('PATCH /:id', () => {
    it('should update user info with valid information', async () => {
      const updatedUser = {
        ...mockUser1,
        firstName: 'UpdatedFirstName',
        lastName: 'UpdatedLastName',
        phone: '777-777-7777',
      };
      mockUserService.update.mockResolvedValue(updatedUser as User);

      const updateUserSchema: UpdateUserInfoDto = {
        firstName: 'UpdatedFirstName',
        lastName: 'UpdatedLastName',
        phone: '777-777-7777',
      };
      const result = await controller.updateInfo(1, updateUserSchema);

      expect(result).toEqual(updatedUser);
      expect(mockUserService.update).toHaveBeenCalledWith(1, updateUserSchema);
    });

    it('should throw BadRequestException when DTO is empty', async () => {
      mockUserService.update.mockRejectedValue(
        new BadRequestException(
          'At least one field must be provided to update',
        ),
      );

      const updateUserSchema: UpdateUserInfoDto = {};

      await expect(controller.updateInfo(1, updateUserSchema)).rejects.toThrow(
        new BadRequestException(
          'At least one field must be provided to update',
        ),
      );
      expect(mockUserService.update).toHaveBeenCalledWith(1, updateUserSchema);
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
      expect(mockUserService.create).toHaveBeenCalledWith(createUserSchema);
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
});
