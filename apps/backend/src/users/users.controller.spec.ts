import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './users.entity';
import { PendingApplication, Role } from './types';
import { userSchemaDto } from './dtos/userSchema.dto';
import { Test, TestingModule } from '@nestjs/testing';
import { mock } from 'jest-mock-extended';
import { UpdateUserInfoDto } from './dtos/update-user-info.dto';
import { UpdateUserRoleDto } from './dtos/update-user-role.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';
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
    mockUserService.getUserDashboardStats.mockReset();
    mockUserService.getRecentPendingApplications.mockReset();
    mockUserService.promoteVolunteerToAdmin.mockReset();

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
      const updateUserSchema: UpdateUserInfoDto = {
        firstName: 'UpdatedFirstName',
        lastName: 'UpdatedLastName',
        phone: '777-777-7777',
      };

      const updatedUser: Partial<User> = {
        ...mockUser1,
        firstName: 'UpdatedFirstName',
        lastName: 'UpdatedLastName',
        phone: '777-777-7777',
      };

      mockUserService.update.mockResolvedValue(updatedUser as User);

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

  describe('GET /:id/stats', () => {
    it('should call getUserDashboardStats and return the result', async () => {
      const mockStats = {
        'Food Requests': '0',
        Orders: '0',
        Donations: '0',
        Volunteers: '4',
      };
      mockUserService.getUserDashboardStats.mockResolvedValue(mockStats);

      const result = await controller.getUserDashboardStats(1);

      expect(result).toEqual(mockStats);
      expect(mockUserService.getUserDashboardStats).toHaveBeenCalledWith(1);
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

  describe('GET /admin/recent-pending-applications', () => {
    it('returns the list of pending applications from the service', async () => {
      const applications: PendingApplication[] = [
        {
          id: 5,
          name: 'Southside Pantry Network',
          type: 'pantry',
          dateApplied: new Date('2024-02-02'),
        },
        {
          id: 6,
          name: 'Harbor Community Center',
          type: 'pantry',
          dateApplied: new Date('2024-02-01'),
        },
        {
          id: 1,
          name: 'FoodCorp Industries',
          type: 'food_manufacturer',
          dateApplied: new Date('2024-01-20'),
        },
      ];

      mockUserService.getRecentPendingApplications.mockResolvedValueOnce(
        applications,
      );

      const result = await controller.getRecentPendingApplications();

      expect(result).toEqual(applications);
      expect(mockUserService.getRecentPendingApplications).toHaveBeenCalled();
    });

    it('returns empty array when there are no pending applications', async () => {
      mockUserService.getRecentPendingApplications.mockResolvedValueOnce([]);

      const result = await controller.getRecentPendingApplications();

      expect(result).toEqual([]);
    });
  });

  describe('PATCH /:id/role', () => {
    it('should promote volunteer to admin successfully', async () => {
      const promotedUser: Partial<User> = {
        ...mockUser1,
        role: Role.ADMIN,
      };

      const dto: UpdateUserRoleDto = { role: Role.ADMIN };

      mockUserService.promoteVolunteerToAdmin.mockResolvedValueOnce(
        promotedUser as User,
      );

      const result = await controller.promoteToAdmin(1, dto);

      expect(result).toEqual(promotedUser);
      expect(result.role).toBe(Role.ADMIN);
      expect(mockUserService.promoteVolunteerToAdmin).toHaveBeenCalledWith(1);
    });

    it('should throw BadRequestException when role is not admin', async () => {
      const dto: UpdateUserRoleDto = { role: Role.VOLUNTEER };

      await expect(controller.promoteToAdmin(1, dto)).rejects.toThrow(
        new BadRequestException('Only promotion to admin is supported'),
      );

      expect(mockUserService.promoteVolunteerToAdmin).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when role is pantry', async () => {
      const dto: UpdateUserRoleDto = { role: Role.PANTRY };

      await expect(controller.promoteToAdmin(1, dto)).rejects.toThrow(
        new BadRequestException('Only promotion to admin is supported'),
      );

      expect(mockUserService.promoteVolunteerToAdmin).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException from service when user not found', async () => {
      const dto: UpdateUserRoleDto = { role: Role.ADMIN };

      mockUserService.promoteVolunteerToAdmin.mockRejectedValueOnce(
        new NotFoundException('User 999 not found'),
      );

      await expect(controller.promoteToAdmin(999, dto)).rejects.toThrow(
        new NotFoundException('User 999 not found'),
      );
    });

    it('should throw BadRequestException from service when user is not a volunteer', async () => {
      const dto: UpdateUserRoleDto = { role: Role.ADMIN };

      mockUserService.promoteVolunteerToAdmin.mockRejectedValueOnce(
        new BadRequestException(
          'User 1 is not a volunteer. Current role: admin',
        ),
      );

      await expect(controller.promoteToAdmin(1, dto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
