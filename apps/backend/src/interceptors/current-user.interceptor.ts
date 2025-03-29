import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class CurrentUserInterceptor implements NestInterceptor {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  async intercept(context: ExecutionContext, handler: CallHandler) {
    const request = context.switchToHttp().getRequest();

    // Get user attributes from Cognito (email and role)
    // const cognitoUserAttributes = await this.authService.getUser(request.user.userId);

    // // If no email or role was found, handle it (optional, log or return an error) (not sure when to use this)
    // if (!cognitoUserAttributes.email) {
    //   console.log('Email not found in Cognito user attributes');
    //   return handler.handle();
    // }

    if (request.user) {
      request.currentUser = {
        id: request.user.userId,
        email: request.user.email,
        role: request.user.role,
      };
    }

    return handler.handle();
  }
}
