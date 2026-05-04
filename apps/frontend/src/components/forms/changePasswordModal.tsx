import { useState } from 'react';
import {
  Box,
  Text,
  VStack,
  Input,
  Button,
  Field,
  Dialog,
  Portal,
  IconButton,
  Group,
} from '@chakra-ui/react';
import { updatePassword } from 'aws-amplify/auth';
import { FloatingAlert } from '@components/floatingAlert';
import { useAlert } from '../../hooks/alert';
import { Eye, EyeOff } from 'lucide-react';

interface ChangePasswordModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [oldPassword, setOldPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [alertState, setAlertMessage] = useAlert();

  const handleChangePassword = async () => {
    if (password.length < 8) {
      setAlertMessage('Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      setAlertMessage('Passwords must match');
      return;
    }

    try {
      await updatePassword({
        oldPassword,
        newPassword: password,
      });

      onClose();
      onSuccess();
    } catch (err: any) {
      if (err.name === 'LimitExceededException') {
        setAlertMessage('Limit exceeded, please try again later');
      } else if (err.name === 'NotAuthorizedException') {
        setAlertMessage('Failed to update password, old password is incorrect');
      } else {
        setAlertMessage('Failed to update password, please try again');
      }
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
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(e: { open: boolean }) => {
        if (!e.open) {
          setAlertMessage('');
          onClose();
        }
      }}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.CloseTrigger />

            <Dialog.Body>
              {alertState && (
                <FloatingAlert
                  key={alertState.id}
                  message={alertState.message}
                  status="error"
                  timeout={6000}
                />
              )}
              <VStack gap={5} align="stretch" py={5}>
                <Box mb={4}>
                  <Dialog.Title>
                    <Text textStyle="h1">Change Password</Text>
                  </Dialog.Title>
                  <Text color="#52525B" textStyle="p2" mt={5}>
                    To reset your password, please provide your old password and
                    the password you would like to update it to.
                  </Text>

                  <VStack align="start" gap={1} mt={3}>
                    <Text textStyle="p2" color="#52525B">
                      Your password must be at least 8 characters.
                    </Text>
                  </VStack>
                </Box>

                <VStack gap={5} align="stretch">
                  <Field.Root required>
                    <Field.Label {...fieldHeaderStyles}>
                      Current Password
                    </Field.Label>
                    <Group attached w="full">
                      <Input
                        type={showOldPassword ? 'text' : 'password'}
                        placeholder="Enter your current password"
                        {...inputStyles}
                        onChange={(e) => setOldPassword(e.target.value)}
                      />
                      <IconButton
                        variant="outline"
                        onClick={() => setShowOldPassword((prev) => !prev)}
                      >
                        <Box color="neutral.200">
                          {showOldPassword && <EyeOff />}
                          {!showOldPassword && <Eye />}
                        </Box>
                      </IconButton>
                    </Group>
                  </Field.Root>
                  <Field.Root required>
                    <Field.Label {...fieldHeaderStyles}>
                      New Password
                    </Field.Label>
                    <Group attached w="full">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter a new password"
                        {...inputStyles}
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

                  <Field.Root required>
                    <Field.Label {...fieldHeaderStyles}>
                      Confirm Password
                    </Field.Label>
                    <Group attached w="full">
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm new password"
                        {...inputStyles}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                      <IconButton
                        variant="outline"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                      >
                        <Box color="neutral.200">
                          {showConfirmPassword && <EyeOff />}
                          {!showConfirmPassword && <Eye />}
                        </Box>
                      </IconButton>
                    </Group>
                  </Field.Root>
                </VStack>

                <Button
                  bgColor="neutral.800"
                  w="full"
                  onClick={handleChangePassword}
                  borderRadius={5}
                  color="white"
                  textStyle="p2"
                  fontWeight={600}
                  mt={8}
                  disabled={!confirmPassword || !password || !oldPassword}
                >
                  Change Password
                </Button>
              </VStack>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};

export default ChangePasswordModal;
