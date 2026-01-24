import { SetMetadata, Type } from '@nestjs/common';

export type OwnerIdResolver = (params: {
  entityId: number;
  services: ServiceRegistry;
}) => Promise<number | null>;

// Registry of services that can be easily resolved
export interface ServiceRegistry {
  get<T>(serviceClass: Type<T>): T;
}

export interface OwnershipConfig {
  idParam: string;
  resolver: OwnerIdResolver;
}

export const OWNERSHIP_CHECK_KEY = 'ownership_check';

export const CheckOwnership = (config: OwnershipConfig) =>
  SetMetadata(OWNERSHIP_CHECK_KEY, config);
