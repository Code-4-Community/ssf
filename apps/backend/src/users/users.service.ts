import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User } from './users.entity';
import { Role } from './types';
import { validateId } from '../utils/validation.utils';
import { UpdateUserInfoDto } from './dtos/update-user-info.dto';
import { AuthService } from '../auth/auth.service';
import { userSchemaDto } from './dtos/userSchema.dto';
import { emailTemplates } from '../emails/emailTemplates';
import { EmailsService } from '../emails/email.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private repo: Repository<User>,
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
      } catch (error) {
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

  async update(id: number, dto: UpdateUserInfoDto): Promise<User> {
    validateId(id, 'User');

    if (
      dto.firstName === undefined &&
      dto.lastName === undefined &&
      dto.phone === undefined
    ) {
      throw new BadRequestException(
        'At least one field must be provided to update',
      );
    }

    const user = await this.findOne(id);

    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }

    Object.assign(user, dto);

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
}
