import React, { useEffect, useState } from 'react';
import { Box, Text, SimpleGrid, Input, Button, HStack } from '@chakra-ui/react';
import { UpdateProfileFields } from 'types/types';

interface AccountInfoSectionProps {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  onSave: (fields: UpdateProfileFields) => Promise<void>;
  isEditing: boolean;
  onEditToggle: () => void;
}

interface ProfileFieldProps {
  label: string;
  value: string;
  name: string;
  isEditing: boolean;
  readOnly?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const headerStyles = {
  fontSize: '14px',
  fontWeight: 600,
  fontFamily: 'inter',
  color: 'neutral.800',
};

const ProfileField: React.FC<ProfileFieldProps> = ({
  label,
  value,
  name,
  isEditing,
  readOnly = false,
  onChange,
}) => (
  <Box>
    <Text {...headerStyles} mb={1}>
      {label}
    </Text>
    {isEditing && !readOnly ? (
      <Input
        name={name}
        value={value}
        onChange={onChange}
        size="sm"
        borderRadius="md"
        width="3/4"
        color="neutral.600"
      />
    ) : (
      <Text color="neutral.800" textStyle="p2">
        {value}
      </Text>
    )}
  </Box>
);

const ProfileAccountInfo: React.FC<AccountInfoSectionProps> = ({
  firstName,
  lastName,
  email,
  phoneNumber,
  onSave,
  isEditing,
  onEditToggle,
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({ firstName, lastName, phoneNumber });

  useEffect(() => {
    setForm({ firstName, lastName, phoneNumber });
  }, [firstName, lastName, phoneNumber]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleCancel = () => {
    setForm({ firstName, lastName, phoneNumber });
    onEditToggle();
  };

  const handleSave = async () => {
    const changed: UpdateProfileFields = {};
    if (form.firstName !== firstName) changed.firstName = form.firstName;
    if (form.lastName !== lastName) changed.lastName = form.lastName;
    if (form.phoneNumber !== phoneNumber) changed.phone = form.phoneNumber;

    if (Object.keys(changed).length === 0) {
      onEditToggle();
      return;
    }

    setIsSaving(true);
    await onSave(changed);
    setIsSaving(false);
    onEditToggle();
  };

  return (
    <Box>
      <SimpleGrid mx={2} columns={2} gapY={12}>
        <ProfileField
          label="First Name"
          name="firstName"
          value={isEditing ? form.firstName : firstName}
          isEditing={isEditing}
          onChange={handleChange}
        />
        <ProfileField
          label="Last Name"
          name="lastName"
          value={isEditing ? form.lastName : lastName}
          isEditing={isEditing}
          onChange={handleChange}
        />
        <ProfileField
          label="Email Address"
          name="email"
          value={email}
          isEditing={isEditing}
          readOnly
          onChange={handleChange}
        />
        <ProfileField
          label="Phone Number"
          name="phoneNumber"
          value={isEditing ? form.phoneNumber : phoneNumber}
          isEditing={isEditing}
          onChange={handleChange}
        />
      </SimpleGrid>

      {isEditing && (
        <HStack
          justify="flex-end"
          gap={3}
          mt={24}
          mb={4}
          fontWeight={600}
          mr={2}
        >
          <Button
            variant="outline"
            size="sm"
            color="neutral.800"
            onClick={handleCancel}
            disabled={isSaving}
            borderColor="neutral.200"
          >
            Cancel
          </Button>
          <Button
            color="white"
            bg="blue.hover"
            variant="solid"
            size="sm"
            px={7}
            onClick={handleSave}
            loading={isSaving}
          >
            Save Changes
          </Button>
        </HStack>
      )}
    </Box>
  );
};

export default ProfileAccountInfo;
