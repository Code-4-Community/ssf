import { BadRequestException } from '@nestjs/common';
import { VolunteersController } from './volunteers.controller'
import { UsersController } from '../users/users.controller';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';
import { Role } from '../users/types';
import { Test, TestingModule } from '@nestjs/testing';
import { mock } from 'jest-mock-extended';
import { Pantry } from '../pantries/pantries.entity';
import { VolunteersService } from './volunteers.service';

const mockVolunteersService = mock<VolunteersService>();

const mockVolunteer1: Partial<User> = {
  id: 1,
  email: 'john@example.com',
  firstName: 'John',
  lastName: 'Doe',
  phone: '1234567890',
  role: Role.VOLUNTEER,
};

const mockVolunteer2: Partial<User> = {
  id: 2543210,
  email: 'bobsmith@example.com',
  firstName: 'Bob',
  lastName: 'Smith',
  phone: '9876',
  role: Role.VOLUNTEER,
};

const mockVolunteer3: Partial<User> = {
  id: 3,
  role: Role.VOLUNTEER,
};

const mockPantries: Partial<Pantry>[] = [
  {
    pantryId: 1,
    pantryUser: mockVolunteer1 as User,
  },
  {
    pantryId: 2,
    pantryUser: mockVolunteer1 as User,
  },
  {
    pantryId: 3,
    pantryUser: mockVolunteer2 as User,
  },
];

describe('VolunteersController', () => {
  let controller: VolunteersController;

  beforeEach(async () => {
    mockVolunteersService.findOne.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [VolunteersController],
      providers: [
        {
          provide: VolunteersService,
          useValue: mockVolunteersService,
        },
      ],
    }).compile();

    controller = module.get<VolunteersController>(VolunteersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /', () => {
    it('should return all volunteers', async () => {
      const volunteers: (Omit<Partial<User>, 'pantries'> & {
        pantryIds: number[];
      })[] = [
        {
          id: 1,
          role: Role.VOLUNTEER,
          pantryIds: [1],
        },
        {
          id: 2,
          role: Role.VOLUNTEER,
          pantryIds: [2],
        },
        {
          id: 3,
          role: Role.ADMIN,
          pantryIds: [3],
        },
      ];

      const expectedVolunteers = volunteers.slice(0, 2);

      mockVolunteersService.getVolunteersAndPantryAssignments.mockResolvedValue(
        expectedVolunteers as (Omit<User, 'pantries'> & { pantryIds: number[] })[],
      );

      const result = await controller.getAllVolunteers();

      expect(result).toEqual(expectedVolunteers);
      expect(result.length).toBe(2);
      expect(result.every((u) => u.role === Role.VOLUNTEER)).toBe(true);
      expect(
        mockVolunteersService.getVolunteersAndPantryAssignments,
      ).toHaveBeenCalled();
    });
  });

  describe('GET /:id', () => {
    it('should return a user by id', async () => {
      mockVolunteersService.findOne.mockResolvedValue(mockVolunteer1 as User);

      const result = await controller.getVolunteer(1);

      expect(result).toEqual(mockVolunteer1);
      expect(mockVolunteersService.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('GET /:id/pantries', () => {
    it('should return pantries assigned to a user', async () => {
      mockVolunteersService.getVolunteerPantries.mockResolvedValue(
        mockPantries.slice(0, 2) as Pantry[],
      );

      const result = await controller.getVolunteerPantries(1);

      expect(result).toHaveLength(2);
      expect(result).toEqual(mockPantries.slice(0, 2));
      expect(mockVolunteersService.getVolunteerPantries).toHaveBeenCalledWith(1);
    });
  });

  describe('POST /:id/pantries', () => {
    it('should assign pantries to a volunteer and return result', async () => {
      const pantryIds = [1, 3];
      const updatedUser = {
        ...mockVolunteer3,
        pantries: [mockPantries[0] as Pantry, mockPantries[2] as Pantry],
      } as User;

      mockVolunteersService.assignPantriesToVolunteer.mockResolvedValue(updatedUser);

      const result = await controller.assignPantries(3, pantryIds);

      expect(result).toEqual(updatedUser);
      expect(result.pantries).toHaveLength(2);
      expect(result.pantries[0].pantryId).toBe(1);
      expect(result.pantries[1].pantryId).toBe(3);
      expect(mockVolunteersService.assignPantriesToVolunteer).toHaveBeenCalledWith(
        3,
        pantryIds,
      );
    });
  });
});
