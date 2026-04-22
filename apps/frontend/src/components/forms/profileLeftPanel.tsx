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
  <VStack
    alignItems="center"
    mt={8}
    mb={6}
    p={{ base: 4, md: 6, lg: 10 }}
    minW={0}
  >
    <Box
      w={{ base: 14, md: 20, lg: 24 }}
      h={{ base: 14, md: 20, lg: 24 }}
      borderRadius="full"
      bg={avatarBg}
      display="flex"
      alignItems="center"
      justifyContent="center"
      mb={4}
    >
      <Text
        color="neutral.50"
        fontSize={{ base: '18px', md: '26px', lg: '32px' }}
      >
        {initials}
      </Text>
    </Box>

    <VStack gap={0}>
      <Text
        fontFamily="ibm"
        fontWeight="semibold"
        fontSize={{ base: '14px', md: '17px', lg: '20px' }}
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
      mt={{ base: 8, md: 16, lg: 24 }}
      px={{ base: 3, md: 6, lg: 8 }}
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
