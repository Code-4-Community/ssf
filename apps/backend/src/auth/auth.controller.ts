import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';

import { SignInDto } from './dtos/sign-in.dto';
import { SignUpDto } from './dtos/sign-up.dto';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { VerifyUserDto } from './dtos/verify-user.dto';
import { DeleteUserDto } from './dtos/delete-user.dto';
import { User } from '../users/user.entity';
import { SignInResponseDto } from './dtos/sign-in-response.dto';
import { RefreshTokenDto } from './dtos/refresh-token.dto';
import { AuthGuard } from '@nestjs/passport';
import { ConfirmPasswordDto } from './dtos/confirm-password.dto';
import { ForgotPasswordDto } from './dtos/forgot-password.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Post('/signup')
  async createUser(@Body() signUpDto: SignUpDto): Promise<User> {
    // By default, creates a standard user
    try {
      await this.authService.signup(signUpDto);
    } catch (e) {
      throw new BadRequestException(e.message);
    }

    const user = await this.usersService.create(
      signUpDto.email,
      signUpDto.firstName,
      signUpDto.lastName,
    );

    return user;
  }

  // TODO deprecated if verification code is replaced by link
  @Post('/verify')
  verifyUser(@Body() body: VerifyUserDto): void {
    try {
      this.authService.verifyUser(body.email, body.verificationCode);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Post('/signin')
  signin(@Body() signInDto: SignInDto): Promise<SignInResponseDto> {
    return this.authService.signin(signInDto);
  }

  @Post('/refresh')
  refresh(@Body() refreshDto: RefreshTokenDto): Promise<SignInResponseDto> {
    return this.authService.refreshToken(refreshDto);
  }

  @Post('/forgotPassword')
  forgotPassword(@Body() body: ForgotPasswordDto): Promise<void> {
    return this.authService.forgotPassword(body.email);
  }

  @Post('/confirmPassword')
  confirmPassword(@Body() body: ConfirmPasswordDto): Promise<void> {
    return this.authService.confirmForgotPassword(body);
  }

  @Post('/delete')
  async delete(@Body() body: DeleteUserDto): Promise<void> {
    const user = await this.usersService.findOne(body.userId);

    try {
      await this.authService.deleteUser(user.email);
    } catch (e) {
      throw new BadRequestException(e.message);
    }

    this.usersService.remove(user.id);
  }
}
