import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Text,
  VStack,
  Input,
  Button,
  Link,
  Field,
} from '@chakra-ui/react';
import { resetPassword, confirmResetPassword } from 'aws-amplify/auth';

const ResetPasswordModal: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [step, setStep] = useState<'reset' | 'new'>('reset');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  const navigate = useNavigate();

  const handleSendCode = async () => {
    try {
      await resetPassword({ username: email });
      setStep('new');
    } catch (error) {
      alert(error || 'Failed to send verification code');
    }
  };

  const handleResendCode = async () => {
    try {
      await resetPassword({ username: email });
      alert('Successfully sent verification code')
    } catch (error) {
      alert(error || 'Failed to send verification code');
    }
  };

  const handleResetPassword = async () => {
    if (password !== confirmPassword) {
      alert('Passwords need to match');
      return;
    }

    try {
      await confirmResetPassword({
        username: email,
        confirmationCode: code,
        newPassword: password,
      });
      alert('Password reset successful!');
      navigate('/login');
    } catch (error) {
      alert(error || 'Failed to set new password');
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

  const inputStyles = {
    borderColor: 'neutral.100',
    textStyle: 'p2',
    color: 'neutral.700',
    _placeholder: { ...placeholderStyles },
  }

  return (
    <Box
      maxW="500px"
      w="full"
      bg="white"
      p={8}
      borderRadius="xl"
      boxShadow="xl"
    >
      <VStack gap={5} align="stretch">
        <Box mb={4}>
          <Text textStyle="h1">
            {step === 'reset' ? 'Reset Password' : 'Enter New Password'}
          </Text>
          <Text color="#52525B" textStyle="p2" mt={2}>
            {step === 'reset'
              ? 'To reset your password please enter the email associated with your account.'
              : 'Please confirm your verification code and set a new password.'}
          </Text>
          {step !== 'reset' && (
            <VStack align="start" gap={1} mt={3}>
              <Text textStyle="p2" color="#52525B">
                Your password must:
              </Text>
              <Text textStyle="p2" color="#52525B">• Be at least 8 characters</Text>
            </VStack>
          )}
        </Box>

        <Field.Root required>
          <Field.Label {...fieldHeaderStyles}>
            {step === 'reset' ? 'Email' : 'Verification Code'}
          </Field.Label>
          <Input
            key={step}
            type='text'
            placeholder={step === 'reset' ? 'Enter Email' : 'Enter Code'}
            {...inputStyles}
            onChange={
              step === 'new'
                ? (e) => setCode(e.target.value)
                : (e) => setEmail(e.target.value)
            }
          />
        </Field.Root>

        {step === 'new' && (
          <VStack gap={5} align="stretch">
            <Field.Root required>
              <Field.Label {...fieldHeaderStyles}>New Password</Field.Label>
              <Input
                type="password"
                placeholder="Enter new password"
                {...inputStyles}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Field.Root>
            <Field.Root required>
              <Field.Label {...fieldHeaderStyles}>Confirm Password</Field.Label>
              <Input
                type="password"
                placeholder="Confirm Password"
                {...inputStyles}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </Field.Root>
          </VStack>
        )}

        {step === 'new' && (
          <Button
            bgColor="white"
            w="full"
            onClick={handleResendCode}
            border="1.5px solid"
            color="neutral.800"
            textStyle="p2"
            borderRadius="0"
            fontWeight={600}
            mt={8}
          >
            Resend Code
          </Button>
        )}

        <Button
          bgColor="neutral.800"
          w="full"
          onClick={step === 'new' ? handleResetPassword : handleSendCode}
          borderRadius={5}
          color="white"
          textStyle="p2"
          fontWeight={600}
          mt={step === 'new' ? 0 : 16}
          disabled={
            step === 'reset' ? !email : !password || !confirmPassword || !code
          }
        >
          {step === 'reset' ? 'Send Verification Code' : 'Reset Password'}
        </Button>
      </VStack>
      <Text
        textStyle="p2"
        color="neutral.600"
        textAlign="center"
        mt={6}
        mb={10}
      >
        Return to{' '}
        <Link
          textStyle="p2"
          color="neutral.600"
          onClick={() => navigate('/login')}
          variant="underline"
          textDecorationColor="neutral.300"
        >
          Login
        </Link>
      </Text>
    </Box>
  );
};

export default ResetPasswordModal;
