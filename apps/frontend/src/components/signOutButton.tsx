import { Button, ButtonProps } from '@chakra-ui/react';
import { signOut } from 'aws-amplify/auth';

type SignOutButtonProps = ButtonProps

const SignOutButton: React.FC<SignOutButtonProps> = (props) => {
  const handleSignOut = async () => {
    await signOut();
  };

  return <Button onClick={handleSignOut} {...props}>sign out</Button>;
};

export default SignOutButton;
