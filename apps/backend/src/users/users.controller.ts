import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  //UseGuards,
  //UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
//import { AuthGuard } from '@nestjs/passport';
import { User } from './user.entity';
//import { CurrentUserInterceptor } from '../interceptors/current-user.interceptor';

@Controller('users')
//@UseInterceptors(CurrentUserInterceptor)
export class UsersController {
  constructor(private usersService: UsersService) {}

  // @UseGuards(AuthGuard('jwt'))
  @Get('/:userId')
  async getUser(@Param('userId', ParseIntPipe) userId: number): Promise<User> {
    return this.usersService.findOne(userId);
  }

  @Delete('/:id')
  removeUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.usersService.remove(userId);
  }
}
