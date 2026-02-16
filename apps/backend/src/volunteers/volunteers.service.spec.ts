import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { Role } from '../users/types';
import { mock } from 'jest-mock-extended';
import { BadRequestException } from '@nestjs/common';
import { PantriesService } from '../pantries/pantries.service';
import { UsersService } from '../users/users.service';
import { VolunteersService } from './volunteers.service';
import { Pantry } from '../pantries/pantries.entity';

const mockUserRepository = mock<Repository<User>>();
const mockPantriesService = mock<PantriesService>();
const mockUsersService = mock<UsersService>();

const mockVolunteer: Partial<User> = {
  id: 1,
  email: 'test@example.com',
  firstName: 'John',
  lastName: 'Doe',
  phone: '1234567890',
  role: Role.VOLUNTEER,
  pantries: [],
};

const mockNonVolunteer: Partial<User> = {
  id: 2,
  email: 'admin@example.com',
  firstName: 'Jane',
  lastName: 'Smith',
  phone: '0987654321',
  role: Role.ADMIN,
  pantries: [],
};

describe('VolunteersService', () => {
  let service: VolunteersService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        VolunteersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: PantriesService,
          useValue: mockPantriesService,
        },
      ],
    }).compile();

    service = module.get<VolunteersService>(VolunteersService);
  });

  beforeEach(() => {
    mockUserRepository.findOne.mockReset();
    mockUserRepository.save.mockReset();
    mockUserRepository.find.mockReset();
    mockUserRepository.remove.mockReset();
    mockPantriesService.findByIds.mockReset();
    mockUsersService.findUsersByRoles.mockReset();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should return a volunteer by id', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockVolunteer as User);

      const result = await service.findOne(1);

      expect(result).toEqual(mockVolunteer);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['pantries'],
      });
    });

    it('should throw NotFoundException when user is not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(
        new NotFoundException('Volunteer 999 not found'),
      );
    });

    it('should throw NotFoundException when user is not a volunteer', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockNonVolunteer as User);

      await expect(service.findOne(2)).rejects.toThrow(
        new NotFoundException('User 2 is not a volunteer'),
      );
    });

    it('should throw error for invalid id', async () => {
      await expect(service.findOne(-1)).rejects.toThrow(
        new BadRequestException('Invalid Volunteer ID'),
      );

      expect(mockUserRepository.findOne).not.toHaveBeenCalled();
    });
  });

  describe('getVolunteersAndPantryAssignments', () => {
    it('should return volunteers with pantry IDs', async () => {
      const mockPantry: Partial<Pantry> = {
        pantryId: 1,
        pantryName: 'Test Pantry',
      };
      const volunteerWithPantries = {
        ...mockVolunteer,
        pantries: [mockPantry as Pantry],
      };

      mockUsersService.findUsersByRoles.mockResolvedValue([
        volunteerWithPantries as User,
      ]);

      const result = await service.getVolunteersAndPantryAssignments();

      expect(result).toEqual([
        {
          id: 1,
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          phone: '1234567890',
          role: Role.VOLUNTEER,
          pantryIds: [1],
        },
      ]);
      expect(mockUsersService.findUsersByRoles).toHaveBeenCalledWith([
        Role.VOLUNTEER,
      ]);
    });
  });

  describe('getVolunteerPantries', () => {
    it('should return pantries for a volunteer', async () => {
      const mockPantry: Partial<Pantry> = {
        pantryId: 1,
        pantryName: 'Test Pantry',
      };
      const volunteerWithPantries = {
        ...mockVolunteer,
        pantries: [mockPantry as Pantry],
      };

      mockUserRepository.findOne.mockResolvedValue(
        volunteerWithPantries as User,
      );

      const result = await service.getVolunteerPantries(1);

      expect(result).toEqual([mockPantry]);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['pantries'],
      });
    });

    it('should throw error for invalid volunteer id', async () => {
      await expect(service.getVolunteerPantries(-1)).rejects.toThrow(
        new BadRequestException('Invalid Volunteer ID'),
      );
    });
  });

  describe('assignPantriesToVolunteer', () => {
    it('should assign new pantries to volunteer', async () => {
      const mockPantry1: Partial<Pantry> = {
        pantryId: 1,
        pantryName: 'Pantry 1',
      };
      const mockPantry2: Partial<Pantry> = {
        pantryId: 2,
        pantryName: 'Pantry 2',
      };

      const volunteerWithPantries = {
        ...mockVolunteer,
        pantries: [mockPantry1 as Pantry],
      };

      mockUserRepository.findOne.mockResolvedValue(
        volunteerWithPantries as User,
      );
      mockPantriesService.findByIds.mockResolvedValue([mockPantry2 as Pantry]);
      mockUserRepository.save.mockResolvedValue({
        ...volunteerWithPantries,
        pantries: [mockPantry1 as Pantry, mockPantry2 as Pantry],
      } as User);

      const result = await service.assignPantriesToVolunteer(1, [2]);

      expect(result.pantries).toHaveLength(2);
      expect(mockPantriesService.findByIds).toHaveBeenCalledWith([2]);
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it('should not add duplicate pantries', async () => {
      const mockPantry: Partial<Pantry> = {
        pantryId: 1,
        pantryName: 'Pantry 1',
      };

      const volunteerWithPantries = {
        ...mockVolunteer,
        pantries: [mockPantry as Pantry],
      };

      mockUserRepository.findOne.mockResolvedValue(
        volunteerWithPantries as User,
      );
      mockPantriesService.findByIds.mockResolvedValue([mockPantry as Pantry]);
      mockUserRepository.save.mockResolvedValue(volunteerWithPantries as User);

      const result = await service.assignPantriesToVolunteer(1, [1]);

      expect(result.pantries).toHaveLength(1);
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it('should throw error for invalid volunteer id', async () => {
      await expect(service.assignPantriesToVolunteer(-1, [1])).rejects.toThrow(
        new BadRequestException('Invalid Volunteer ID'),
      );
    });

    it('should throw error for invalid pantry id', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockVolunteer as User);

      await expect(service.assignPantriesToVolunteer(1, [-1])).rejects.toThrow(
        new BadRequestException('Invalid Pantry ID'),
      );
    });
  });
});
