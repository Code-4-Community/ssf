import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Put,
  Post,
  BadRequestException,
  Body,
  //UseGuards,
  //UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
//import { AuthGuard } from '@nestjs/passport';
import { User } from './user.entity';
import { Role } from './types';
import { VOLUNTEER_ROLES } from './types';
import { userSchemaDto } from './dtos/userSchema.dto';
import { updateUserInfo } from './dtos/updateUserInfo.dto';
//import { CurrentUserInterceptor } from '../interceptors/current-user.interceptor';

@Controller('users')
//@UseInterceptors(CurrentUserInterceptor)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('/volunteers')
  async getAllVolunteers(): Promise<User[]> {
    return this.usersService.findUsersByRoles(VOLUNTEER_ROLES);
  }

  // @UseGuards(AuthGuard('jwt'))
  @Get('/:id')
  async getUser(@Param('id', ParseIntPipe) userId: number): Promise<User> {
    return this.usersService.findOne(userId);
  }

  @Delete('/:id')
  removeUser(@Param('id', ParseIntPipe) userId: number) {
    return this.usersService.remove(userId);
  }

  @Put(':id/role')
  async updateRole(
    @Param('id', ParseIntPipe) id: number,
    @Body('role') role: string,
  ) {
    if (!Object.values(Role).includes(role as Role)) {
      throw new BadRequestException('Invalid role');
    }
    return this.usersService.update(id, { role: role as Role });
  }

  @Put(':id/info')
  async updateInfo(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserInfo: updateUserInfo,
  ) {
    const { firstName, lastName, phone } = updateUserInfo;

    const updateData: Partial<User> = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (phone !== undefined) updateData.phone = phone;

    return this.usersService.update(id, updateData);
  }

  @Post('/')
  async createUser(@Body() createUserDto: userSchemaDto): Promise<User> {
    const { email, firstName, lastName, phone, role } = createUserDto;
    return this.usersService.create(email, firstName, lastName, phone, role);
  }
}
