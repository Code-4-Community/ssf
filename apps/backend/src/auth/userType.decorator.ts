import { SetMetadata, Type } from '@nestjs/common';

export interface OwnershipConfig<TService> {
  service: Type<TService>;
  idParam: string;
  ownerField: string;
}

export const OWNERSHIP_CHECK_KEY = 'ownership_check';

export const CheckOwnership = <TService>(config: OwnershipConfig<TService>) =>
  SetMetadata(OWNERSHIP_CHECK_KEY, config);