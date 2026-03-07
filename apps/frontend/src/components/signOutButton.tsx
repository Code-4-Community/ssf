import apiClient from '@api/apiClient';
import { Button, ButtonProps } from '@chakra-ui/react';
import { signOut } from 'aws-amplify/auth';
import { useNavigate } from 'react-router-dom';

type SignOutButtonProps = ButtonProps;

const SignOutButton: React.FC<SignOutButtonProps> = (props) => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <Button onClick={handleSignOut} {...props}>
      sign out
    </Button>
  );
};

export default SignOutButton;
