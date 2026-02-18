import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
  Type,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ModuleRef } from '@nestjs/core';
import {
  OWNERSHIP_CHECK_KEY,
  OwnershipConfig,
  ServiceRegistry,
} from './ownership.decorator';

@Injectable()
export class OwnershipGuard implements CanActivate {
  constructor(private reflector: Reflector, private moduleRef: ModuleRef) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const config = this.reflector.get<OwnershipConfig>(
      OWNERSHIP_CHECK_KEY,
      context.getHandler(),
    );

    if (!config) {
      return true;
    }

    // Process all request information and the logged in user
    const req = context.switchToHttp().getRequest();
    const user = req.user;

    // Admins bypass ownership checks
    if (user.role === 'ADMIN') {
      return true;
    }

    if (!user) {
      throw new ForbiddenException('Not authenticated');
    }

    // Get the id from the parameters
    const entityId = Number(req.params[config.idParam]);

    if (isNaN(entityId)) {
      throw new ForbiddenException(`Invalid ${config.idParam}`);
    }

    // Create a service registry that easily resolves services
    const services = this.createServiceRegistry();

    try {
      // Execute the lambda function to get the owner user ID
      const ownerId = await config.resolver({
        entityId,
        services,
      });

      if (ownerId === null || ownerId === undefined) {
        throw new ForbiddenException('Unable to determine resource ownership');
      }

      if (ownerId !== user.id) {
        throw new ForbiddenException('Access denied');
      }

      return true;
    } catch (error) {
      throw new ForbiddenException('Error verifying resource ownership');
    }
  }

  // Use a service registry for easy service resolution and caching
  private createServiceRegistry(): ServiceRegistry {
    const cache = new Map<Type<unknown>, unknown>();
    const moduleRef = this.moduleRef;

    return {
      get<T>(serviceClass: Type<T>): T {
        // Return cached service if already resolved before
        if (cache.has(serviceClass)) {
          return cache.get(serviceClass) as T;
        }

        // Resolve and cache the service
        try {
          const service = moduleRef.get(serviceClass, { strict: false });
          cache.set(serviceClass, service);
          return service;
        } catch (error) {
          throw new Error(`Could not resolve service: ${serviceClass.name}`);
        }
      },
    };
  }
}
