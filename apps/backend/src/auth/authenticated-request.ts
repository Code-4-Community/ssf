import { Request } from 'express';
import { User } from '../users/user.entity';

export interface AuthenticatedRequest extends Request {
  user: User;
}
