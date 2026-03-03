import { SetMetadata, Type } from '@nestjs/common';

// Resolver function type to get the owner user ID for a given entity ID
// Should return the user ID of the user who is authorized to call the
// endpoint that the decorator is attached to
// If the resolver returns null, it will be treated as if the user is not authorized
export type OwnerIdResolver = (params: {
  entityId: number;
  services: ServiceRegistry;
}) => Promise<number[] | null>;

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

/**
 * Parses lambdas and uses their output as the next input
 * Useed within ownership checks with service functions to
 * navigate through entities to retrieve our desired user IDs
 *
 * @param initFn The initial function to execute, usually a service function that takes in the entity ID and returns an entity
 * @param fns The series of functions that follows, each taking in the output of the previous function and returning either the next entity or the final user ID(s)
 * @returns a list of user IDs that are authorized to access the resource, or null if the ownership cannot be determined (treat as unauthorized)
 */
export async function pipeNullable<T>(
  initFn: () => Promise<any> | any,
  ...fns: Array<(arg: NonNullable<any>) => Promise<any> | any>
): Promise<any | null> {
  let acc = await initFn();
  for (const fn of fns) {
    if (acc === null || acc === undefined) return null;
    acc = await fn(acc);
  }
  return acc ?? null;
}

export const CheckOwnership = (config: OwnershipConfig) =>
  SetMetadata(OWNERSHIP_CHECK_KEY, config);
