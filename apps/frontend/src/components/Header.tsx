import React from 'react';
import SignOutButton from './signOutButton';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { Link as RouterLink } from 'react-router-dom';
import { ROUTES } from '../routes';
import { Link } from '@chakra-ui/react';

const Header = () => {
  const { user } = useAuthenticator((context) => [context.user]);

  return (
    <div style={{ display: 'flex', gap: '16px' }}>
      <Link asChild>
        <RouterLink to={ROUTES.HOME}>Securing Safe Food</RouterLink>
      </Link>

      {user && <SignOutButton size="sm" variant="outline"></SignOutButton>}
    </div>
  );
};

export default Header;
