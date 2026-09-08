import { Outlet, useNavigate } from 'react-router-dom';
import { Box, Flex } from '@chakra-ui/react';
import { useEffect } from 'react';
import apiClient from '@api/apiClient';
import Navbar from '../components/Navbar';
import { UserProvider } from '../components/userContext';

const Root: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    apiClient.setNavigate(navigate);
  }, [navigate]);

  return (
    <UserProvider>
      <Flex minH="100vh">
        <Navbar />
        <Box flex={1} overflow="auto">
          <Outlet />
        </Box>
      </Flex>
    </UserProvider>
  );
};

export default Root;
