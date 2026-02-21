import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { Role } from './types';
import { mock } from 'jest-mock-extended';
import { In } from 'typeorm';
import { BadRequestException } from '@nestjs/common';
import { PantriesService } from '../pantries/pantries.service';

const mockUserRepository = mock<Repository<User>>();
const mockPantriesService = mock<PantriesService>();

const mockUser: Partial<User> = {
  id: 1,
  email: 'test@example.com',
  firstName: 'John',
  lastName: 'Doe',
  phone: '1234567890',
  role: Role.VOLUNTEER,
};

describe('UsersService', () => {
  let service: UsersService;

  beforeAll(async () => {
    mockUserRepository.create.mockReset();
    mockUserRepository.save.mockReset();
    mockUserRepository.findOneBy.mockReset();
    mockUserRepository.find.mockReset();
    mockUserRepository.remove.mockReset();
    mockPantriesService.findByIds.mockReset();

    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: PantriesService,
          useValue: mockPantriesService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  beforeEach(() => {
    mockUserRepository.create.mockReset();
    mockUserRepository.save.mockReset();
    mockUserRepository.findOneBy.mockReset();
    mockUserRepository.find.mockReset();
    mockUserRepository.remove.mockReset();
    mockPantriesService.findByIds.mockReset();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user with auto-generated ID', async () => {
      const userData = {
        email: 'newuser@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        phone: '9876543210',
        role: Role.ADMIN,
      } as User;

      const createdUser = { ...userData, id: 1 };
      mockUserRepository.create.mockReturnValue(createdUser);
      mockUserRepository.save.mockResolvedValue(createdUser);

      const result = await service.create(
        userData.email,
        userData.firstName,
        userData.lastName,
        userData.phone,
        userData.role,
      );

      expect(result).toEqual(createdUser);
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        role: userData.role,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phone: userData.phone,
      });
      expect(mockUserRepository.save).toHaveBeenCalledWith(createdUser);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(mockUser as User);

      const result = await service.findOne(1);

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
    });

    it('should throw NotFoundException when user is not found', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(
        new NotFoundException('User 999 not found'),
      );
    });

    it('should throw error for invalid id', async () => {
      await expect(service.findOne(-1)).rejects.toThrow(
        new BadRequestException('Invalid User ID'),
      );

      expect(mockUserRepository.findOneBy).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update user attributes', async () => {
      const updateData = { firstName: 'Updated', role: Role.ADMIN };
      const updatedUser = { ...mockUser, ...updateData };

      mockUserRepository.findOneBy.mockResolvedValue(mockUser as User);
      mockUserRepository.save.mockResolvedValue(updatedUser as User);

      const result = await service.update(1, updateData);

      expect(result).toEqual(updatedUser);
      expect(mockUserRepository.save).toHaveBeenCalledWith(updatedUser);
    });

    it('should throw NotFoundException when user is not found', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(null);

      await expect(
        service.update(999, { firstName: 'Updated' }),
      ).rejects.toThrow(new NotFoundException('User 999 not found'));
    });

    it('should throw error for invalid id', async () => {
      await expect(
        service.update(-1, { firstName: 'Updated' }),
      ).rejects.toThrow(new BadRequestException('Invalid User ID'));

      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove a user by id', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(mockUser as User);
      mockUserRepository.remove.mockResolvedValue(mockUser as User);

      const result = await service.remove(1);

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.remove).toHaveBeenCalledWith(mockUser);
    });

    it('should throw NotFoundException when user is not found', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(
        new NotFoundException('User 999 not found'),
      );
    });

    it('should throw error for invalid id', async () => {
      await expect(service.remove(-1)).rejects.toThrow(
        new BadRequestException('Invalid User ID'),
      );

      expect(mockUserRepository.remove).not.toHaveBeenCalled();
    });
  });

  describe('findUsersByRoles', () => {
    it('should return users by roles', async () => {
      const roles = [Role.ADMIN, Role.VOLUNTEER];
      const users = [mockUser];
      mockUserRepository.find.mockResolvedValue(users as User[]);

      const result = await service.findUsersByRoles(roles);

      expect(result).toEqual(users);
      expect(mockUserRepository.find).toHaveBeenCalledWith({
        where: { role: In(roles) },
        relations: ['pantries'],
      });
    });

    it('should return empty array when no users found', async () => {
      const roles = [Role.ADMIN];
      mockUserRepository.find.mockResolvedValue([]);

      const result = await service.findUsersByRoles(roles);

      expect(result).toEqual([]);
    });
  });
});
