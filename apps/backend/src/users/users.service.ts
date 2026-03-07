import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User } from './user.entity';
import { Role } from './types';
import { validateId } from '../utils/validation.utils';
import { AuthService } from '../auth/auth.service';
import { userSchemaDto } from './dtos/userSchema.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private repo: Repository<User>,

    private authService: AuthService,
  ) {}

  async create(createUserDto: userSchemaDto): Promise<User> {
    const { email, firstName, lastName, phone, role } = createUserDto;

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
    return this.repo.save(user);
  }

  async findOne(id: number): Promise<User> {
    validateId(id, 'User');

    const user = await this.repo.findOneBy({ id });

    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }
    return user;
  }

  async update(id: number, attrs: Partial<User>) {
    validateId(id, 'User');

    const user = await this.findOne(id);

    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }

    Object.assign(user, attrs);

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
