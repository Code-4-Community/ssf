import { SetMetadata, Type } from '@nestjs/common';

export interface OwnershipConfig<T = any> {
  service: Type<T>;
  idParam: string;
  ownerField: string;
}

export const OWNERSHIP_CHECK_KEY = 'ownership_check';

export const CheckOwnership = (config: OwnershipConfig) =>
  SetMetadata(OWNERSHIP_CHECK_KEY, config);
