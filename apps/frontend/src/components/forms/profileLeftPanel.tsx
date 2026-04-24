import React from 'react';
import { VStack, Text, Button, Box, useDisclosure } from '@chakra-ui/react';
import { LockKeyhole } from 'lucide-react';
import ChangePasswordModal from './changePasswordModal';
import { useAlert } from '../../hooks/alert';
import { FloatingAlert } from '@components/floatingAlert';

interface ProfileLeftPanelProps {
  name: string;
  roleLabel: string;
  initials: string;
  avatarBg: string;
}

const ProfileLeftPanel: React.FC<ProfileLeftPanelProps> = ({
  name,
  roleLabel,
  initials,
  avatarBg,
}) => {
  const { open, onOpen, onClose } = useDisclosure();
  const [alertState, setAlertMessage] = useAlert();

  return (
    <VStack alignItems="center" mt="2vw" mb="1.5vw" p="2.5vw">
      {alertState && (
        <FloatingAlert
          key={alertState.id}
          message={alertState.message}
          status="info"
          timeout={6000}
        />
      )}
      <Box
        w="6vw"
        h="6vw"
        borderRadius="full"
        bg={avatarBg}
        display="flex"
        alignItems="center"
        justifyContent="center"
        mb="1vw"
      >
        <Text color="neutral.50" fontSize="2vw">
          {initials}
        </Text>
      </Box>

      <VStack gap={0}>
        <Text
          fontFamily="ibm"
          fontWeight="semibold"
          fontSize="1.25vw"
          textAlign="center"
          mb={0}
        >
          {name}
        </Text>

        <Text
          fontFamily="inter"
          fontWeight="400"
          fontSize="1vw"
          textAlign="center"
        >
          {roleLabel}
        </Text>
      </VStack>

      <Button
        mt="6vw"
        style={{
          padding: '0.5vw 2vw',
          fontSize: '0.875vw',
          height: 'auto',
          minHeight: 'auto',
        }}
        bg="red"
        color="white.core"
        onClick={onOpen}
      >
        <LockKeyhole style={{ width: '1vw', height: '1vw' }} />
        Change Password
      </Button>

      <ChangePasswordModal
        open={open}
        onClose={onClose}
        onSuccess={() => setAlertMessage('Password successfully changed')}
      ></ChangePasswordModal>
    </VStack>
  );
};

export default ProfileLeftPanel;
