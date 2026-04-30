import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Text, VStack, Button, Link } from '@chakra-ui/react';
import loginBackground from '../assets/login_background.png';
import AuthHeader from '@components/AuthHeader';
import { ROUTES } from '../routes';
import { useEffect } from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { authStatus } = useAuthenticator((context) => [context.authStatus]);

  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (authStatus === 'authenticated') {
      navigate(from, { replace: true });
    }
  }, [authStatus, from, navigate]);

  return (
    <Box minH="100vh" w="full" display="flex" flexDirection="column">
      <AuthHeader />
      <Box
        flex={1}
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
              bgColor="yellow.ssf"
              w="full"
              borderRadius={5}
              color="white"
              textStyle="p2"
              fontWeight={600}
              onClick={() => navigate(ROUTES.PANTRY_APPLICATION)}
            >
              Food Pantry Partner
            </Button>

            <Button
              bgColor="blue.ssf"
              w="full"
              borderRadius={5}
              color="white"
              textStyle="p2"
              fontWeight={600}
              onClick={() => navigate(ROUTES.FOOD_MANUFACTURER_APPLICATION)}
            >
              Food Manufacturer (Donor) Partner
            </Button>
          </VStack>
          <Text textStyle="p2" color="neutral.600" textAlign="center" mt={24}>
            Already have an account?{' '}
            <Link
              textStyle="p2"
              color="neutral.600"
              onClick={() => navigate(ROUTES.LOGIN)}
              variant="underline"
              textDecorationColor="neutral.300"
            >
              Log in
            </Link>
          </Text>
        </Box>
      </Box>
    </Box>
  );
};

export default SignupPage;
