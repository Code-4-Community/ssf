import { Button } from '@chakra-ui/react';
import { signOut } from 'aws-amplify/auth';

const SignOutButton: React.FC = () => {
  const handleSignOut = async () => {
    await signOut();
  };

  return <Button onClick={handleSignOut}>sign out</Button>;
};

export default SignOutButton;
