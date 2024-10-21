import { Center, Stack } from '@chakra-ui/react';
import React, { useState } from 'react';

const handlePantryLogin = () => {
  console.log('Pantry login');
};
const handleSSFLogin = () => {
  console.log('SSF login');
};

const PantryLoginForm = () => {
  return (
    <Stack sx={{ width: '30vw' }} align={'center'}>
      <p>Pantry Log in</p>
      <Stack sx={{ width: '50%' }}>
        <input type="text" placeholder="Username" />
        <input type="text" placeholder="Password" />
        <button type="submit" onClick={handlePantryLogin}>
          Log in
        </button>
      </Stack>
    </Stack>
  );
};
const SSFLoginForm = () => {
  return (
    <Stack sx={{ width: '30vw' }} align={'center'}>
      <p>SSF Log in</p>
      <Stack sx={{ width: '50%' }}>
        <input type="text" placeholder="Username" />
        <input type="text" placeholder="Password" />
        <button type="submit" onClick={handleSSFLogin}>
          Log in
        </button>
      </Stack>
    </Stack>
  );
};

export { PantryLoginForm, SSFLoginForm };
