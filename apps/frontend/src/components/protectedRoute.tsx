import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getCurrentUser } from '@aws-amplify/auth';
import { Center, Spinner, Text } from '@chakra-ui/react';

type Props = {
  children: JSX.Element;
};

const ProtectedRoute = ({ children }: Props) => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    getCurrentUser()
      .then(() => setAuthenticated(true))
      .catch(() => setAuthenticated(false))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <Center h="100vh" flexDirection="column">
        <Spinner size="lg" />
        <Text mt={4}>Loading...</Text>
      </Center>
    );

  if (!authenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
};

export default ProtectedRoute;
