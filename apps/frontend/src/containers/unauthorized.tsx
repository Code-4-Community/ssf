import { Link as RouterLink } from 'react-router-dom';
import { Button, Center, Text, VStack } from '@chakra-ui/react';
import { ROUTES } from '../routes';

export const Unauthorized: React.FC = () => {
  return (
    <Center h="100vh">
      <VStack gap={4} textAlign="center">
        <Text size="lg">This page is unavailable.</Text>
        <Button
          as={RouterLink}
          to={ROUTES.PROFILE}
          size="sm"
          bg="neutral.700"
          color="white"
          _hover={{ bg: 'neutral.800' }}
        >
          Return to profile page
        </Button>
      </VStack>
    </Center>
  );
};

export default Unauthorized;
