import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, In, Repository } from 'typeorm';
import { User } from './users.entity';
import { Role } from './types';
import { validateId } from '../utils/validation.utils';
import { UpdateUserInfoDto } from './dtos/update-user-info.dto';
import { AuthService } from '../auth/auth.service';
import { userSchemaDto } from './dtos/userSchema.dto';
import { emailTemplates } from '../emails/emailTemplates';
import { EmailsService } from '../emails/email.service';
import { FoodRequest } from '../foodRequests/request.entity';
import { Order } from '../orders/order.entity';
import { Donation } from '../donations/donations.entity';
import { AggregatedStatsDto } from './dtos/aggregated-stats.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private repo: Repository<User>,
    @InjectRepository(FoodRequest)
    private foodRequestRepo: Repository<FoodRequest>,
    @InjectRepository(Order)
    private orderRepo: Repository<Order>,
    @InjectRepository(Donation)
    private donationRepo: Repository<Donation>,
    private authService: AuthService,
    private emailsService: EmailsService,
  ) {}

  async create(createUserDto: userSchemaDto): Promise<User> {
    const { email, firstName, lastName, phone, role } = createUserDto;
    const emailsEnabled = process.env.SEND_AUTOMATED_EMAILS === 'true';

    // Just save to DB if emails are disabled (no Cognito creation)
    if (!emailsEnabled) {
      const user = this.repo.create({
        role,
        firstName,
        lastName,
        email,
        phone,
      });
      return this.repo.save(user);
    }

    // Pantry and food manufacturer users must already exist in the DB
    // (created during application) before a Cognito account is made
    if (role === Role.PANTRY || role === Role.FOODMANUFACTURER) {
      const existingUser = await this.repo.findOneBy({ email });
      if (!existingUser) {
        throw new NotFoundException(`User with email ${email} not found`);
      }
      existingUser.userCognitoSub = await this.authService.adminCreateUser({
        firstName,
        lastName,
        email,
      });
      return this.repo.save(existingUser);
    }

    // Create Cognito user and save to DB
    const userCognitoSub = await this.authService.adminCreateUser({
      firstName,
      lastName,
      email,
    });
    const user = this.repo.create({
      role,
      firstName,
      lastName,
      email,
      phone,
      userCognitoSub,
    });

    await this.repo.save(user);

    // Send welcome email to new volunteers (only after successful creation)
    if (role === Role.VOLUNTEER) {
      try {
        const message = emailTemplates.volunteerAccountCreated();
        await this.emailsService.sendEmails(
          [email],
          message.subject,
          message.bodyHTML,
        );
      } catch {
        throw new InternalServerErrorException(
          'Failed to send account created notification email to volunteer',
        );
      }
    }

    return user;
  }

  async findOne(id: number): Promise<User> {
    validateId(id, 'User');

    const user = await this.repo.findOneBy({ id });

    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }
    return user;
  }

  // given userIds should not have duplicates
  async findByIds(userIds: number[]): Promise<User[]> {
    userIds.forEach((id) => validateId(id, 'User'));

    const users = await this.repo.findBy({ id: In(userIds) });

    if (users.length !== userIds.length) {
      const foundIds = new Set(users.map((u) => u.id));
      const missingIds = userIds.filter((id) => !foundIds.has(id));
      throw new NotFoundException(`Users not found: ${missingIds.join(', ')}`);
    }

    return users;
  }

  async update(id: number, dto: UpdateUserInfoDto): Promise<User> {
    validateId(id, 'User');

    const { firstName, lastName, phone } = dto;

    if (
      firstName === undefined &&
      lastName === undefined &&
      phone === undefined
    ) {
      throw new BadRequestException(
        'At least one field must be provided to update',
      );
    }

    const user = await this.findOne(id);

    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }

    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (phone !== undefined) user.phone = phone;

    return this.repo.save(user);
  }

  async remove(id: number) {
    validateId(id, 'User');

    const user = await this.findOne(id);

    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }

    return this.repo.remove(user);
  }

  async findUsersByRoles(roles: Role[]): Promise<User[]> {
    return this.repo.find({
      where: { role: In(roles) },
      relations: ['pantries'],
    });
  }

  async findUserByCognitoId(cognitoId: string): Promise<User> {
    const user = await this.repo.findOneBy({ userCognitoSub: cognitoId });
    if (!user) {
      throw new NotFoundException(`User with cognitoId ${cognitoId} not found`);
    }
    return user;
  }

  async getMonthlyAggregatedStats(): Promise<AggregatedStatsDto> {
    const now = new Date();
    const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );

    const [foodRequestsCount, ordersCount, donationsCount, volunteersCount] =
      await Promise.all([
        this.foodRequestRepo.count({
          where: { requestedAt: Between(startMonth, endMonth) },
        }),
        this.orderRepo.count({
          where: { createdAt: Between(startMonth, endMonth) },
        }),
        this.donationRepo.count({
          where: { dateDonated: Between(startMonth, endMonth) },
        }),
        this.repo.count({ where: { role: Role.VOLUNTEER } }),
      ]);

    return {
      'Food Requests': foodRequestsCount.toString(),
      Orders: ordersCount.toString(),
      Donations: donationsCount.toString(),
      Volunteers: volunteersCount.toString(),
    };
  }
}
