import SignOutButton from '@components/signOutButton';
import { useAuthenticator } from '@aws-amplify/ui-react';

const LandingPage: React.FC = () => {
  const { user } = useAuthenticator((context) => [context.user]);
  return (
    <>
      Landing page
      {user && <SignOutButton />}
    </>
  );
};

export default LandingPage;