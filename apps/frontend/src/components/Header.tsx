import React from 'react';
import SignOutButton from './signOutButton';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { useNavigate } from 'react-router-dom';
import { Link } from '@chakra-ui/react';

const Header = () => {
  const { user } = useAuthenticator((context) => [context.user]);
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', gap: '16px' }}>
      <Link onClick={() => navigate('/')}>
        <h1>Securing Safe Food</h1>
      </Link>

      {user && <SignOutButton size="sm" variant="outline"></SignOutButton>}
    </div>
  );
};

export default Header;
