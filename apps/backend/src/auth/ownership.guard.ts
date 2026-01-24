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
import { OWNERSHIP_CHECK_KEY, OwnershipConfig, ServiceRegistry } from './ownership.decorator';

@Injectable()
export class OwnershipGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private moduleRef: ModuleRef,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const config = this.reflector.get<OwnershipConfig>(
      OWNERSHIP_CHECK_KEY,
      context.getHandler(),
    );
    
    console.log('Entered ownership guard with config:', config);

    if (!config) {
      return true;
    }

    const req = context.switchToHttp().getRequest();
    const user = req.user;

    if (!user) {
      throw new ForbiddenException('Not authenticated');
    }

    const entityId = Number(req.params[config.idParam]);
    
    if (isNaN(entityId)) {
      throw new ForbiddenException(`Invalid ${config.idParam}`);
    }
    //console.log('Creating service registry for ownership check');
    // Create a service registry that lazily resolves services
    const services = this.createServiceRegistry();

    try {
      // Execute the lambda function to get the owner user ID
      const ownerId = await config.resolver({
        entityId,
        services,
      });

      //console.log(`Ownership check: entityId=${entityId}, ownerId=${ownerId}, userId=${user.id}`);

      if (ownerId === null || ownerId === undefined) {
        throw new ForbiddenException('Unable to determine resource ownership');
      }

      if (ownerId !== user.id) {
        throw new ForbiddenException('Access denied - you do not own this resource');
      }

      return true;
    } catch (error) {
      if (error instanceof ForbiddenException || error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error in ownership resolver:', error);
      throw new ForbiddenException('Error verifying resource ownership');
    }
  }

  private createServiceRegistry(): ServiceRegistry {
    const cache = new Map<Type<unknown>, unknown>();
    const moduleRef = this.moduleRef;

    return {
      get<T>(serviceClass: Type<T>): T {
        // Return cached service if already resolved
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