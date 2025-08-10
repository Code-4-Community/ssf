import { Button } from '@chakra-ui/react';
import SignOutButton from '@components/signOutButton';
import { signOut } from 'aws-amplify/auth';

const LandingPage: React.FC = () => {
  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <>
      Landing page
      <SignOutButton />
    </>
  );
};

export default LandingPage;
