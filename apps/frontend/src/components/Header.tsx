import React from 'react';
import SignOutButton from './signOutButton';
import { useAuthenticator } from '@aws-amplify/ui-react';

const Header = () => {
  const { user } = useAuthenticator((context) => [context.user]);

  return (
    <div style={{ display: 'flex', gap: '16px' }}>
      <h1>Securing Safe Food</h1>
      {user && <SignOutButton size="sm" variant="outline"></SignOutButton>}
    </div>
  );
};

export default Header;
