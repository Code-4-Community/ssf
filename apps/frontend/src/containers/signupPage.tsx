import { useNavigate } from 'react-router-dom';
import { Box, Text, VStack, Button, Link } from '@chakra-ui/react';
import loginBackground from '../assets/login_background.png';

const SignupPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box
      minH="100vh"
      w="full"
      bgImage={`url(${loginBackground})`}
      bgSize="cover"
      bgPos="center"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <Box
        maxW="500px"
        w="full"
        bg="white"
        p={8}
        borderRadius="xl"
        boxShadow="xl"
      >
        <VStack gap={12} align="stretch">
          <Box>
            <Text textStyle="h1">Sign Up</Text>
            <Text color="#52525B" textStyle="p2" mt={2}>
              Please select your specified user type to begin your account
              creation.
            </Text>
          </Box>

          <Button
            bgColor="yellow"
            w="full"
            borderRadius={5}
            color="white"
            textStyle="p2"
            fontWeight={600}
            onClick={() => navigate('/pantry-application')}
          >
            Food Pantry Partner
          </Button>

          <Button
            bgColor="#2B4E60"
            w="full"
            borderRadius={5}
            color="white"
            textStyle="p2"
            fontWeight={600}
            onClick={() => navigate('/food-manufacturer-application')}
          >
            Food Manufacturer (Donor) Partner
          </Button>
        </VStack>
        <Text textStyle="p2" color="neutral.600" textAlign="center" mt={24}>
          Already have an account?{' '}
          <Link
            textStyle="p2"
            color="neutral.600"
            onClick={() => navigate('/login')}
            variant="underline"
            textDecorationColor="neutral.600"
          >
            Log in
          </Link>
        </Text>
      </Box>
    </Box>
  );
};

export default SignupPage;
