import SignOutButton from '@components/signOutButton';
import { useAuthenticator } from '@aws-amplify/ui-react';

const LandingPage: React.FC = () => {
  const { user } = useAuthenticator((context) => [context.user]);
  console.log('LandingPage user:', user);
  return (
    <>
      Landing page
      {/* Only show if user exists */}
      {user && <SignOutButton />}
    </>
  );
};

export default LandingPage;