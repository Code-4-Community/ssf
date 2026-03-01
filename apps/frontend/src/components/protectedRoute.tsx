import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { Center, Spinner, Text } from '@chakra-ui/react';

type Props = {
  children?: JSX.Element;
};

const ProtectedRoute = ({ children }: Props) => {
  const { authStatus } = useAuthenticator((context) => [context.authStatus]);
  const location = useLocation();

  if (authStatus === 'configuring') {
    return (
      <Center h="100vh" flexDirection="column">
        <Spinner size="lg" />
        <Text mt={4}>Loading...</Text>
      </Center>
    );
  }

  if (authStatus !== 'authenticated') {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children ?? <Outlet />;
};

export default ProtectedRoute;
