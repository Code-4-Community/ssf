import { Request } from 'express';
import { User } from '../users/user.entity';

// user does not have to be provided by the client but is added automatically by the auth backend
export interface AuthenticatedRequest extends Request {
  user: User;
}
