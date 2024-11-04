import { Stack } from '@chakra-ui/react';

const handlePantryLogin = () => {
  console.log('Pantry login');
};
const handlePantrySignUp = () => {
  console.log('Pantry sign up');
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
        <button type="submit" onClick={handlePantrySignUp}>
          Sign up
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
