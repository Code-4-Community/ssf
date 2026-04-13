import React from 'react';
import { VStack, Text, Button, Box, useDisclosure } from '@chakra-ui/react';
import { LockKeyhole } from 'lucide-react';
import ChangePasswordModal from './changePasswordModal';

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

  return (
    <VStack alignItems="center" mt={8} mb={6} p={10}>
      <Box
        w={24}
        h={24}
        borderRadius="full"
        bg={avatarBg}
        display="flex"
        alignItems="center"
        justifyContent="center"
        mb={4}
      >
        <Text color="neutral.50" fontSize="32px">
          {initials}
        </Text>
      </Box>

      <VStack gap={0}>
        <Text
          fontFamily="ibm"
          fontWeight="semibold"
          fontSize="20px"
          textAlign="center"
          mb={0}
        >
          {name}
        </Text>

        <Text textStyle="p2" textAlign="center">
          {roleLabel}
        </Text>
      </VStack>

      <Button
        mt={24}
        px={8}
        bg="red"
        size="sm"
        color="white.core"
        onClick={onOpen}
      >
        <LockKeyhole />
        Change Password
      </Button>

      <ChangePasswordModal open={open} onClose={onClose}></ChangePasswordModal>
    </VStack>
  );
};

export default ProfileLeftPanel;
