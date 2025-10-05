import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { Role } from './types';
import { userSchema } from './users.controller';

describe('UsersController', () => {
  let controller: UsersController;

  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    phone: '1234567890',
    role: Role.STANDARD_VOLUNTEER,
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
      const volunteers = [mockUser];
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
      mockUsersService.findOne.mockResolvedValue(mockUser);

      const result = await controller.getUser(1);

      expect(result).toEqual(mockUser);
      expect(mockUsersService.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('removeUser', () => {
    it('should remove a user by id', async () => {
      mockUsersService.remove.mockResolvedValue(mockUser);

      const result = await controller.removeUser(1);

      expect(result).toEqual(mockUser);
      expect(mockUsersService.remove).toHaveBeenCalledWith(1);
    });
  });

  describe('updateRole', () => {
    it('should update user role with valid role', async () => {
      const updatedUser = { ...mockUser, role: Role.ADMIN };
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
      const createUserDto: userSchema = {
        email: 'newuser@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        phone: '9876543210',
        role: Role.ADMIN,
      };

      const createdUser = { ...createUserDto, id: 2 };
      mockUsersService.create.mockResolvedValue(createdUser);

      const result = await controller.createUser(createUserDto);

      expect(result).toEqual(createdUser);
      expect(mockUsersService.create).toHaveBeenCalledWith(
        createUserDto.email,
        createUserDto.firstName,
        createUserDto.lastName,
        createUserDto.phone,
        createUserDto.role,
      );
    });

    it('should create a new user with default role when role is not provided', async () => {
      const createUserDto: userSchema = {
        email: 'newuser@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        phone: '9876543210',
      };

      const createdUser = {
        ...createUserDto,
        id: 2,
        role: Role.STANDARD_VOLUNTEER,
      };
      mockUsersService.create.mockResolvedValue(createdUser);

      const result = await controller.createUser(createUserDto);

      expect(result).toEqual(createdUser);
      expect(mockUsersService.create).toHaveBeenCalledWith(
        createUserDto.email,
        createUserDto.firstName,
        createUserDto.lastName,
        createUserDto.phone,
        undefined, // role should be undefined when not provided
      );
    });

    it('should handle service errors', async () => {
      const createUserDto: userSchema = {
        email: 'newuser@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        phone: '9876543210',
      };

      const error = new Error('Database error');
      mockUsersService.create.mockRejectedValue(error);

      await expect(controller.createUser(createUserDto)).rejects.toThrow(error);
    });
  });
});
