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

    if (request.user) {
      const user = await this.authService.getUser(request.user.sub);

      const dbUser = await this.usersService.findByEmail(user.email);
      console.log(dbUser);
      request.currentUser = dbUser;
    }

    return handler.handle();
  }
}
