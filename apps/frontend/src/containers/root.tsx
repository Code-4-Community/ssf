import { Outlet, useNavigate } from 'react-router-dom';
import { Box, Flex } from '@chakra-ui/react';
import { useEffect } from 'react';
import apiClient from '@api/apiClient';
import Navbar from '../components/Navbar';

const Root: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    apiClient.setNavigate(navigate);
  }, [navigate]);

  return (
    <Flex minH="100vh">
      <Navbar />
      <Box flex={1} overflow="auto">
        <Outlet />
      </Box>
    </Flex>
  );
};

export default Root;
