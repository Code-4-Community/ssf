import React, { useEffect, useState } from 'react';
import { Box, Center, Heading, Spinner, Text } from '@chakra-ui/react';
import ApiClient from '../api/apiClient';
import { Role, UpdateProfileFields, User } from '../types/types';
import ProfileLeftPanel from '@components/forms/profileLeftPanel';
import ProfileAccountInfo from '@components/forms/profileAccountInfo';
import { getInitials } from '@utils/utils';
import { useAlert } from '../hooks/alert';
import { FloatingAlert } from '@components/floatingAlert';
import axios from 'axios';

const ROLE_CONFIG: Record<Role, { label: string; avatarBg: string }> = {
  [Role.ADMIN]: { label: 'Admin', avatarBg: 'yellow.ssf' },
  [Role.VOLUNTEER]: { label: 'Volunteer', avatarBg: 'red' },
  [Role.PANTRY]: { label: 'Pantry', avatarBg: 'blue.400' },
  [Role.FOODMANUFACTURER]: { label: 'Food Manufacturer', avatarBg: 'teal.ssf' },
};

const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [alertState, setAlertMessage] = useAlert();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const user: User = await ApiClient.getMe();
        setProfile(user);
      } catch {
        setAlertMessage('Authentication error. Please log in and try again.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [setAlertMessage]);

  const handleSave = async (fields: UpdateProfileFields): Promise<boolean> => {
    if (!profile) {
      setAlertMessage('Profile not found.');
      return false;
    }

    try {
      const updated: User = await ApiClient.updateUser(profile.id, fields);
      setProfile(updated);
      return true;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        if (status === 400 || status === 404) {
          setAlertMessage(error.response?.data?.message);
        } else {
          setAlertMessage(
            'Profile unable to be edited. Please try again later.',
          );
        }
      } else {
        setAlertMessage('An unexpected error occurred. Please try again.');
      }
      return false;
    }
  };

  if (isLoading) {
    return (
      <Center minH="100vh">
        <Spinner />
      </Center>
    );
  }

  if (!profile) {
    return (
      <Center minH="100vh">
        <Text color="red.500">Profile not found.</Text>
      </Center>
    );
  }

  const { firstName, lastName, role } = profile;
  const config = ROLE_CONFIG[role];
  const hasTabs = role === Role.PANTRY || role === Role.FOODMANUFACTURER;

  return (
    <Box width="100%" p={8}>
      {alertState && (
        <FloatingAlert
          key={alertState.id}
          message={alertState.message}
          status="error"
          timeout={6000}
        />
      )}
      <Heading textStyle="h1" fontWeight="normal" color="gray.light" mb={6}>
        Profile
      </Heading>

      <Box
        display="flex"
        alignItems="stretch"
        borderRadius="lg"
        borderWidth="1px"
        borderColor="neutral.100"
        overflow="hidden"
        w="100%"
        bg="neutral.50"
      >
        <Box flexShrink={0}>
          <ProfileLeftPanel
            name={`${firstName} ${lastName}`}
            roleLabel={config.label}
            initials={getInitials(firstName, lastName)}
            avatarBg={config.avatarBg}
          />
        </Box>

        <Box w="1px" bg="neutral.100" flexShrink={0} />

        <Box p={8} flex={1} bg="white" minW={0}>
          <ProfileAccountInfo
            profile={profile}
            showTabs={hasTabs}
            onSave={handleSave}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default ProfilePage;
