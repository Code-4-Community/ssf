import { useState } from 'react';
import { signIn } from '@aws-amplify/auth';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Text,
  VStack,
  Input,
  Button,
  Link,
  Field,
  IconButton,
  Group,
} from '@chakra-ui/react';
import loginBackground from '../assets/login_background.png';
import { Eye, EyeOff } from 'lucide-react';
import { FloatingAlert } from '@components/floatingAlert';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string>('');
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleLogin = async () => {
    try {
      await signIn({ username: email, password });
      navigate(from, { replace: true });
    } catch (error) {
      setAlertMessage('Login failed: ' + error);
    }
  };

  const fieldHeaderStyles = {
    color: 'neutral.800',
    fontFamily: 'inter',
    fontSize: 'sm',
    fontWeight: '600',
  };

  const placeholderStyles = {
    color: 'neutral.300',
    fontFamily: 'inter',
    fontSize: 'sm',
    fontWeight: '400',
  };

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
      {alertMessage && (
        <FloatingAlert message={alertMessage} status="error" timeout={6000} />
      )}
      <Box
        maxW="500px"
        w="full"
        bg="white"
        p={8}
        borderRadius="xl"
        boxShadow="xl"
      >
        <VStack gap={10} align="stretch">
          <Box>
            <Text textStyle="h1">Log In</Text>
            <Text color="#52525B" textStyle="p2" mt={2}>
              Welcome to the Securing Safe Food (SSF) Portal. Please log in with
              your account credentials.
            </Text>
          </Box>

          <Field.Root required>
            <Field.Label {...fieldHeaderStyles}>Email</Field.Label>
            <Input
              name="email"
              type="text"
              borderColor="neutral.100"
              placeholder="Enter email"
              textStyle="p2"
              color="neutral.700"
              _placeholder={{ ...placeholderStyles }}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field.Root>

          <Field.Root required>
            <Field.Label {...fieldHeaderStyles}>Password</Field.Label>
            <Group attached w="full">
              <Input
                name="password"
                type={showPassword ? 'text' : 'password'}
                borderColor="neutral.100"
                placeholder="Enter password"
                textStyle="p2"
                color="neutral.700"
                _placeholder={{ ...placeholderStyles }}
                onChange={(e) => setPassword(e.target.value)}
              />
              <IconButton
                variant="outline"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                <Box color="neutral.200">
                  {showPassword && <EyeOff />}
                  {!showPassword && <Eye />}
                </Box>
              </IconButton>
            </Group>
          </Field.Root>

          <Button
            bgColor="neutral.800"
            w="full"
            onClick={handleLogin}
            borderRadius={4}
            color="white"
            textStyle="p2"
            fontWeight={600}
            disabled={!password || !email}
          >
            Log In
          </Button>
        </VStack>
        <Text textStyle="p2" color="neutral.600" textAlign="center" mt={6}>
          Don’t have an account?{' '}
          <Link
            textStyle="p2"
            color="neutral.600"
            onClick={() => navigate('/signup')}
            variant="underline"
            textDecorationColor="neutral.300"
          >
            Sign up
          </Link>
        </Text>

        <Text fontSize="sm" textAlign="center" mt={12} fontWeight={400}>
          <Link color="red" onClick={() => navigate('/forgot-password')}>
            Reset Password
          </Link>
        </Text>
      </Box>
    </Box>
  );
};

export default LoginPage;
