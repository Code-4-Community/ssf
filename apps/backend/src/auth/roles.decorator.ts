import { SetMetadata } from '@nestjs/common';
import { Role } from '../users/types';

// Key used to store roles metadata
export const ROLES_KEY = 'roles';
// Custom decorator to set roles metadata on route handlers for proper parsing by RolesGuard
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
