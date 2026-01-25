import { SetMetadata, Type } from '@nestjs/common';

// Resolver function type to get the owner user ID for a given entity ID
export type OwnerIdResolver = (params: {
  entityId: number;
  services: ServiceRegistry;
}) => Promise<number | null>;

// Registry of services that can be easily resolved
// Eliminates the issues with circular dependencies
// allowing the lambdas to resolve only the services they need
export interface ServiceRegistry {
  get<T>(serviceClass: Type<T>): T;
}

// Configuration for ownership check
export interface OwnershipConfig {
  idParam: string;
  resolver: OwnerIdResolver;
}

export const OWNERSHIP_CHECK_KEY = 'ownership_check';

export const CheckOwnership = (config: OwnershipConfig) =>
  SetMetadata(OWNERSHIP_CHECK_KEY, config);
