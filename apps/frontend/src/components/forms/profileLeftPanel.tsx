import React from 'react';
import { VStack, Text, Button, Box } from '@chakra-ui/react';
import { LockKeyhole } from 'lucide-react';

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
}) => (
  <VStack alignItems="center" mt={8} mb={6} p={10}>
    <Box
      p={5}
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
      onClick={() => {
        // TODO: add functionality
      }}
    >
      <LockKeyhole />
      Change Password
    </Button>
  </VStack>
);

export default ProfileLeftPanel;
