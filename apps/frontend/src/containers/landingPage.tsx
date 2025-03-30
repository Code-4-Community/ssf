import { Button } from '@chakra-ui/react';
import { signOut } from 'aws-amplify/auth';

const LandingPage: React.FC = () => {
  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <>
      Landing page
      <Button onClick={handleSignOut}> sign out</Button>
    </>
  );
};

export default LandingPage;
