import { User } from '../users/users.entity';

export function coordinatorContact(assignee: User | null): {
  name: string;
  email: string;
} {
  return assignee
    ? {
        name: `${assignee.firstName} ${assignee.lastName}`,
        email: assignee.email,
      }
    : {
        name: 'the Securing Safe Food team',
        email: 'partners@securingsafefood.org',
      };
}
