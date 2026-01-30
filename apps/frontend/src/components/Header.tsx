import React from 'react';
import SignOutButton from './signOutButton';

const Header = () => {
  return (
    <div style={{ display: 'flex', gap: '16px' }}>
      <h1>Securing Safe Food</h1>
      <SignOutButton size="sm" variant="outline"></SignOutButton>
    </div>
  );
};

export default Header;
