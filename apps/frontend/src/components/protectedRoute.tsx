import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { ROUTES } from '../routes';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { Center, Spinner, Text } from '@chakra-ui/react';
import { Role } from '../types/types';
import { useCurrentUser } from './userContext';

type Props = {
  children?: JSX.Element;
  allowedRoles?: Role[];
};

const ProtectedRoute = ({ children, allowedRoles }: Props) => {
  const { authStatus } = useAuthenticator((context) => [context.authStatus]);
  const location = useLocation();
  const { user, loading: roleLoading } = useCurrentUser();
  const role = user?.role ?? null;

  if (
    authStatus === 'configuring' ||
    (allowedRoles && authStatus === 'authenticated' && roleLoading)
  ) {
    return (
      <Center h="100vh" flexDirection="column">
        <Spinner size="lg" />
        <Text mt={4}>Loading...</Text>
      </Center>
    );
  }

  if (authStatus !== 'authenticated') {
    return <Navigate to={ROUTES.LOGIN} replace state={{ from: location }} />;
  }

  if (allowedRoles && (!role || !allowedRoles.includes(role))) {
    return <Navigate to={ROUTES.UNAUTHORIZED} replace />;
  }

  return children ?? <Outlet />;
};

export default ProtectedRoute;
