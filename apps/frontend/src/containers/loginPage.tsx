import { useState } from 'react';
import { ROUTES } from '../routes';
import { signIn, confirmSignIn, fetchAuthSession } from '@aws-amplify/auth';
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
import { useAlert } from '../hooks/alert';
import AuthHeader from '@components/AuthHeader';

type Step = 'login' | 'new-password';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmNewPassword, setConfirmNewPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [step, setStep] = useState<Step>('login');
  const [alertState, setAlertMessage] = useAlert();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || ROUTES.HOME;

  const handleLogin = async () => {
    try {
      const result = await signIn({ username: email, password });
      // On temporary password signin, this will trigger the need to create a new password
      if (
        result.nextStep.signInStep ===
        'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED'
      ) {
        setStep('new-password');
      } else {
        navigate(from, { replace: true });
      }
    } catch {
      setAlertMessage('Login failed');
    }
  };

  // Sets the new password for the first time
  const handleSetNewPassword = async () => {
    if (newPassword !== confirmNewPassword) {
      setAlertMessage('Passwords need to match');
      return;
    }
    if (newPassword.length < 8) {
      setAlertMessage('Password needs to be at least 8 characters');
      return;
    }

    try {
      await confirmSignIn({ challengeResponse: newPassword });
      // Wait for auth session to establish
      await fetchAuthSession({ forceRefresh: true });
      navigate(from, { replace: true });
    } catch {
      setAlertMessage('Failed to set new password');
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
        {alertState && (
          <FloatingAlert
            key={alertState.id}
            message={alertState.message}
            status="error"
            timeout={6000}
          />
        )}
        <Box
          maxW="500px"
          w="full"
          bg="white"
          p={8}
          borderRadius="xl"
          boxShadow="xl"
        >
          {step === 'login' ? (
            <VStack gap={10} align="stretch">
              <Box>
                <Text textStyle="h1">Log In</Text>
                <Text color="#52525B" textStyle="p2" mt={2}>
                  Welcome to the Securing Safe Food (SSF) Portal. Please log in
                  with your account credentials.
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
          ) : (
            <VStack gap={10} align="stretch">
              <Box>
                <Text textStyle="h1">Set New Password</Text>
                <Text color="#52525B" textStyle="p2" mt={2}>
                  Your account requires a new password before continuing. Your
                  password should be at least 8 characters.
                </Text>
              </Box>

              <Field.Root required>
                <Field.Label {...fieldHeaderStyles}>New Password</Field.Label>
                <Group attached w="full">
                  <Input
                    name="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    borderColor="neutral.100"
                    placeholder="Enter new password"
                    textStyle="p2"
                    color="neutral.700"
                    _placeholder={{ ...placeholderStyles }}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <IconButton
                    variant="outline"
                    onClick={() => setShowNewPassword((prev) => !prev)}
                  >
                    <Box color="neutral.200">
                      {showNewPassword && <EyeOff />}
                      {!showNewPassword && <Eye />}
                    </Box>
                  </IconButton>
                </Group>
              </Field.Root>

              <Field.Root required>
                <Field.Label {...fieldHeaderStyles}>
                  Confirm Password
                </Field.Label>
                <Group attached w="full">
                  <Input
                    key="confirmNewPassword"
                    name="confirmNewPassword"
                    type={showConfirmNewPassword ? 'text' : 'password'}
                    borderColor="neutral.100"
                    placeholder="Confirm new password"
                    textStyle="p2"
                    color="neutral.700"
                    _placeholder={{ ...placeholderStyles }}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                  />
                  <IconButton
                    variant="outline"
                    onClick={() => setShowConfirmNewPassword((prev) => !prev)}
                  >
                    <Box color="neutral.200">
                      {showConfirmNewPassword && <EyeOff />}
                      {!showConfirmNewPassword && <Eye />}
                    </Box>
                  </IconButton>
                </Group>
              </Field.Root>

              <Button
                bgColor="neutral.800"
                w="full"
                onClick={handleSetNewPassword}
                borderRadius={4}
                color="white"
                textStyle="p2"
                fontWeight={600}
                disabled={!newPassword || !confirmNewPassword}
              >
                Set Password
              </Button>
            </VStack>
          )}

          {step === 'login' && (
            <>
              <Text
                textStyle="p2"
                color="neutral.600"
                textAlign="center"
                mt={6}
              >
                Don't have an account?{' '}
                <Link
                  textStyle="p2"
                  color="neutral.600"
                  onClick={() => navigate(ROUTES.SIGNUP)}
                  variant="underline"
                  textDecorationColor="neutral.300"
                >
                  Sign up
                </Link>
              </Text>

              <Text fontSize="sm" textAlign="center" mt={12} fontWeight={400}>
                <Link
                  color="red"
                  onClick={() => navigate(ROUTES.FORGOT_PASSWORD)}
                >
                  Forgot Password?
                </Link>
              </Text>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default LoginPage;
