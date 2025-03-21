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
    const cognitoUserAttributes = await this.authService.getUser(
      request.user.userId,
    );
    const userEmail = cognitoUserAttributes.find(
      (attribute) => attribute.Name === 'email',
    ).Value;
    const users = await this.usersService.find(userEmail);

    if (users.length > 0) {
      const user = users[0];

      request.user = {
        id: user.id,
        email: user.email,
        role: user.role,
      };
    }

    return handler.handle();
  }
}
