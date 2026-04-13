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
} from '@chakra-ui/react';
import { updatePassword } from 'aws-amplify/auth';
import { FloatingAlert } from '@components/floatingAlert';
import { useAlert } from '../../hooks/alert';

interface ChangePasswordModalProps {
  open: boolean;
  onClose: () => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  open,
  onClose,
}) => {
  const [oldPassword, setOldPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [alertState, setAlertMessage] = useAlert();

  const handleChangePassword = async () => {
    if (password !== confirmPassword) {
      setAlertMessage('Passwords must match');
      return;
    }

    if (password.length < 8) {
      setAlertMessage('Password must be at least 8 characters');
      return;
    }

    try {
      await updatePassword({
        oldPassword,
        newPassword: password,
      });

      onClose();
    } catch {
      setAlertMessage('Failed to update password');
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
      onOpenChange={(e: any) => {
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
                  <Text textStyle="h1">Change Password</Text>
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
                    <Input
                      type="password"
                      placeholder="Enter your current password"
                      {...inputStyles}
                      onChange={(e) => setOldPassword(e.target.value)}
                    />
                  </Field.Root>
                  <Field.Root required>
                    <Field.Label {...fieldHeaderStyles}>
                      New Password
                    </Field.Label>
                    <Input
                      type="password"
                      placeholder="Enter a new password"
                      {...inputStyles}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </Field.Root>

                  <Field.Root required>
                    <Field.Label {...fieldHeaderStyles}>
                      Confirm Password
                    </Field.Label>
                    <Input
                      type="password"
                      placeholder="Confirm new password"
                      {...inputStyles}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
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
