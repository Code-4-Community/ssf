import React, { useEffect, useState } from 'react';
import { Box, Center, Heading, Spinner, Text } from '@chakra-ui/react';
import ApiClient from '../api/apiClient';
import { Role, UpdateProfileFields, User } from '../types/types';
import ProfileLeftPanel from '@components/profile/profileLeftPanel';
import { getInitials } from '@utils/utils';
import ProfileAccountInfo from '@components/profile/profileAccountInfo';
import ProfileLayout from '@components/profile/profileLayout';
import { useAlert } from '../hooks/alert';
import { FloatingAlert } from '@components/floatingAlert';

const ROLE_CONFIG: Record<Role, { label: string; avatarBg: string }> = {
  [Role.ADMIN]: { label: 'Admin', avatarBg: 'yellow.ssf' },
  [Role.VOLUNTEER]: { label: 'Volunteer', avatarBg: 'red' },
  [Role.PANTRY]: { label: 'Pantry', avatarBg: 'blue.400' },
  [Role.FOODMANUFACTURER]: { label: 'Food Manufacturer', avatarBg: 'teal.ssf' },
};

const ApplicationTabPlaceholder: React.FC = () => (
  <Center h="40" color="neutral.700" fontSize="sm">
    Application details coming soon.
  </Center>
);

const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
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

  const handleSave = async (fields: UpdateProfileFields) => {
    if (!profile) return;
    try {
      const updated: User = await ApiClient.updateUser(profile.id, fields);
      setProfile(updated);
    } catch {
      setAlertMessage('Profile unable to be edited. Please try again later.');
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

  const { firstName, lastName, email, phone } = profile;
  const role = profile.role;
  const config = ROLE_CONFIG[role];

  const leftPanel = (
    <ProfileLeftPanel
      name={`${firstName} ${lastName}`}
      roleLabel={config.label}
      initials={getInitials(firstName, lastName)}
      avatarBg={config.avatarBg}
    />
  );

  const accountTab = {
    label: 'Account',
    showEdit: true,
    content: (
      <ProfileAccountInfo
        firstName={firstName}
        lastName={lastName}
        email={email}
        phoneNumber={phone}
        onSave={handleSave}
        isEditing={isEditing}
        onEditToggle={() => setIsEditing((e) => !e)}
      />
    ),
  };

  // TODO: add application tab content
  const tabs =
    role === Role.PANTRY || role === Role.FOODMANUFACTURER
      ? [
          accountTab,
          { label: 'Application', content: <ApplicationTabPlaceholder /> },
        ]
      : [accountTab];

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
      <ProfileLayout
        leftPanel={leftPanel}
        tabs={tabs}
        isEditing={isEditing}
        onEditToggle={() => setIsEditing((e) => !e)}
      />
    </Box>
  );
};

export default ProfilePage;
