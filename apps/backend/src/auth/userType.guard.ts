import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ModuleRef } from '@nestjs/core';
import { OWNERSHIP_CHECK_KEY, OwnershipConfig } from './userType.decorator';

@Injectable()
export class OwnershipGuard implements CanActivate {
  constructor(private reflector: Reflector, private moduleRef: ModuleRef) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const config = this.reflector.get<OwnershipConfig<unknown>>(
      OWNERSHIP_CHECK_KEY,
      context.getHandler(),
    );

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

    let service;
    try {
      service = this.moduleRef.get(config.service, { strict: false });
    } catch (error) {
      console.error('Failed to resolve service:', error);
      throw new Error(`Could not resolve service: ${config.service.name}`);
    }

    const resource = await service.findOne(entityId);

    if (!resource) {
      throw new NotFoundException('Resource not found');
    }

    const ownerId = this.extractValue(resource, config.ownerField);

    if (ownerId === null || ownerId === undefined) {
      throw new ForbiddenException(
        `Unable to determine ownership: field '${config.ownerField}' not found`,
      );
    }

    if (ownerId !== user.id) {
      throw new ForbiddenException(
        'Access denied - you do not own this resource',
      );
    }

    req.resource = resource;

    return true;
  }

  /**
   * Extract a value from an object using either:
   * - Simple property: 'userId' -> obj.userId
   * - Nested property: 'user.id' -> obj.user.id
   * - Deeply nested: 'order.pantry.user.id' -> obj.order.pantry.user.id
   */
  private extractValue(obj: unknown, path: string): unknown {
    // Handle dot notation for nested properties
    if (path.includes('.')) {
      return path.split('.').reduce((current, prop) => {
        return current?.[prop];
      }, obj);
    }

    // Simple property access
    return obj[path];
  }
}
