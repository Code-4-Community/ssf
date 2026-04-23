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
  <VStack alignItems="center" mt="2.2vw" mb="1.7vw" p="2.8vw" minW={0}>
    <Box
      w="6.7vw"
      h="6.7vw"
      borderRadius="full"
      bg={avatarBg}
      display="flex"
      alignItems="center"
      justifyContent="center"
      mb="1.1vw"
    >
      <Text color="neutral.50" fontSize="2.2vw">
        {initials}
      </Text>
    </Box>

    <VStack gap={0}>
      <Text
        fontFamily="ibm"
        fontWeight="semibold"
        fontSize="1.4vw"
        textAlign="center"
        mb={0}
      >
        {name}
      </Text>

      <Text
        fontFamily="inter"
        fontWeight="500"
        fontSize="0.97vw"
        textAlign="center"
      >
        {roleLabel}
      </Text>
    </VStack>

    <Button
      mt="6.7vw"
      px="2.2vw"
      py="0.6vw"
      bg="red"
      fontSize="0.9vw"
      color="white.core"
      onClick={() => {
        // TODO: add functionality
      }}
    >
      <LockKeyhole size="1vw" />
      Change Password
    </Button>
  </VStack>
);

export default ProfileLeftPanel;
