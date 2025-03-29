import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UseInterceptors,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../users/types';
import { ROLES_KEY } from './roles.decorator';

// Guard to enforce role-based access control on route handlers
// Applies logic to get us our user, and compare it with the required roles
// Interacts with the metadata that we attach in the @Roles() decorator
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  // If this returns false, Nest will deny access to the route handler
  // Automatically throwing a Forbidden Exception (403 status code)
  canActivate(context: ExecutionContext): boolean {
    // Look for the metadata we set with the @Roles() decorator
    // Checks in the route handler, then the controller, and makes it undefined if nothing found
    // Routes take priority over controllers in terms of overriding
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(), // method-level
      context.getClass(), // controller-level
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.role) {
      return false;
    }

    return requiredRoles.includes(user.role);
  }
}
