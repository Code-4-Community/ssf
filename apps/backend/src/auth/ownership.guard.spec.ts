import { OwnershipGuard } from './ownership.guard';
import { OwnershipConfig, OwnerIdResolver } from './ownership.decorator';
import { Reflector } from '@nestjs/core';
import { ModuleRef } from '@nestjs/core';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { User } from '../users/user.entity';
import { Role } from '../users/types';

// Helper to create a mock execution context with specified user and params
// Creates the context to determine which user is making the request and what
// parameters are being passed in, such as the entity ID for ownership checks
function makeExecutionContext(user: User | null, params: Record<string, any>) {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ user, params }),
    }),
    getHandler: () => jest.fn(),
  } as any;
}

// Helper to make a reflector that returns specified config for ownership guard tests
// allows us to easily test different ownership check configurations without needing actual decorators or controllers
function makeReflector(config: OwnershipConfig | undefined) {
  return {
    get: jest.fn().mockReturnValue(config),
  } as unknown as Reflector;
}

// Helper to make a module ref that can resolve specified services and throws on unmocked services
// allows us to easily inject mocked services into our ownership guard tests without worrying about circular dependencies
function makeModuleRef(resolvedObjects: Record<string, any> = {}) {
  return {
    get: jest.fn((klass: any) => {
      if (resolvedObjects[klass.name]) {
        return resolvedObjects[klass.name];
      }
      throw new Error(`unmocked service ${klass.name}`);
    }),
  } as unknown as ModuleRef;
}

describe('OwnershipGuard', () => {
  const dummyUser: User = { id: 42, role: Role.VOLUNTEER } as User;
  const adminUser: User = { id: 100, role: Role.ADMIN } as User;

  it('returns true when no config metadata present', async () => {
    const guard = new OwnershipGuard(makeReflector(undefined), makeModuleRef());
    const ctx = makeExecutionContext(dummyUser, { any: 1 });
    await expect(guard.canActivate(ctx)).resolves.toBe(true);
  });

  it('throws NotFoundException if req.user is missing', async () => {
    const config: OwnershipConfig = {
      idParam: 'id',
      resolver: async () => [1],
    };
    const guard = new OwnershipGuard(makeReflector(config), makeModuleRef());
    const ctx = makeExecutionContext(null, { id: 1 });
    await expect(guard.canActivate(ctx)).rejects.toThrow(NotFoundException);
  });

  it('allows admins regardless of ownership', async () => {
    const config: OwnershipConfig = { idParam: 'id', resolver: async () => [] };
    const guard = new OwnershipGuard(makeReflector(config), makeModuleRef());
    const ctx = makeExecutionContext(adminUser, { id: 5 });
    await expect(guard.canActivate(ctx)).resolves.toBe(true);
  });

  it('throws ForbiddenException for invalid numeric param', async () => {
    const config: OwnershipConfig = {
      idParam: 'id',
      resolver: async () => [1],
    };
    const guard = new OwnershipGuard(makeReflector(config), makeModuleRef());
    const ctx = makeExecutionContext(dummyUser, { id: 'not-a-number' });
    await expect(guard.canActivate(ctx)).rejects.toThrow(ForbiddenException);
  });

  it('throws when resolver returns null or undefined', async () => {
    const config: OwnershipConfig = {
      idParam: 'id',
      resolver: async () => null,
    };
    const guard = new OwnershipGuard(makeReflector(config), makeModuleRef());
    const ctx = makeExecutionContext(dummyUser, { id: 10 });
    await expect(guard.canActivate(ctx)).rejects.toThrow(ForbiddenException);

    const config2: OwnershipConfig = {
      idParam: 'id',
      resolver: async () => undefined as any,
    };
    const guard2 = new OwnershipGuard(makeReflector(config2), makeModuleRef());
    const ctx2 = makeExecutionContext(dummyUser, { id: 10 });
    await expect(guard2.canActivate(ctx2)).rejects.toThrow(ForbiddenException);
  });

  it('throws when user id not in returned list', async () => {
    const config: OwnershipConfig = {
      idParam: 'id',
      resolver: async () => [1, 2, 3],
    };
    const guard = new OwnershipGuard(makeReflector(config), makeModuleRef());
    const ctx = makeExecutionContext(dummyUser, { id: 10 });
    await expect(guard.canActivate(ctx)).rejects.toThrow(ForbiddenException);
  });

  it('propagates resolver exception as ForbiddenException', async () => {
    const config: OwnershipConfig = {
      idParam: 'id',
      resolver: async () => {
        throw new Error('boom');
      },
    };
    const guard = new OwnershipGuard(makeReflector(config), makeModuleRef());
    const ctx = makeExecutionContext(dummyUser, { id: 10 });
    await expect(guard.canActivate(ctx)).rejects.toThrow(ForbiddenException);
  });

  it('returns true when user id included in list', async () => {
    const config: OwnershipConfig = {
      idParam: 'id',
      resolver: async () => [dummyUser.id, 9],
    };
    const guard = new OwnershipGuard(makeReflector(config), makeModuleRef());
    const ctx = makeExecutionContext(dummyUser, { id: 10 });
    await expect(guard.canActivate(ctx)).resolves.toBe(true);
  });
});
