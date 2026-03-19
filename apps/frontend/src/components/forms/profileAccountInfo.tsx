import React, { useEffect, useState } from 'react';
import {
  Box,
  Text,
  SimpleGrid,
  Input,
  Button,
  HStack,
  Tabs,
} from '@chakra-ui/react';
import { Pencil } from 'lucide-react';
import { UpdateProfileFields } from 'types/types';

interface ProfileAccountInfoProps {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  showTabs: boolean;
  onSave: (fields: UpdateProfileFields) => Promise<void>;
}

interface ProfileFieldProps {
  label: string;
  value: string;
  name: string;
  isEditing: boolean;
  readOnly?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const labelStyles = {
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
    <Text {...labelStyles} mb={1}>
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

const ProfileAccountInfo: React.FC<ProfileAccountInfoProps> = ({
  firstName,
  lastName,
  email,
  phoneNumber,
  showTabs,
  onSave,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({ firstName, lastName, phoneNumber });

  useEffect(() => {
    setForm({ firstName, lastName, phoneNumber });
  }, [firstName, lastName, phoneNumber]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleCancel = () => {
    setForm({ firstName, lastName, phoneNumber });
    setIsEditing(false);
  };

  const handleSave = async () => {
    const changed: UpdateProfileFields = {};
    if (form.firstName !== firstName) changed.firstName = form.firstName;
    if (form.lastName !== lastName) changed.lastName = form.lastName;
    if (form.phoneNumber !== phoneNumber) changed.phone = form.phoneNumber;

    if (Object.keys(changed).length === 0) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    await onSave(changed);
    setIsSaving(false);
    setIsEditing(false);
  };

  const editButton = (
    <HStack
      gap={1}
      color="neutral.700"
      textStyle="p2"
      fontWeight={600}
      cursor="pointer"
      pb={2}
      _hover={{ color: 'neutral.900' }}
      onClick={() => setIsEditing((e) => !e)}
    >
      <Pencil size={14} />
      <Text fontWeight={600} fontFamily="ibm">
        {isEditing ? 'Editing' : 'Edit'}
      </Text>
    </HStack>
  );

  const fields = (
    <Box>
      <SimpleGrid columns={2} gapY={12}>
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
        <HStack justify="flex-end" gap={3} mt={24}>
          <Button
            variant="outline"
            size="sm"
            color="neutral.800"
            onClick={handleCancel}
            disabled={isSaving}
            borderColor="neutral.200"
            fontWeight={600}
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
            fontWeight={600}
          >
            Save Changes
          </Button>
        </HStack>
      )}
    </Box>
  );

  if (showTabs) {
    return (
      <Tabs.Root defaultValue="Account" variant="line" mx={2}>
        <HStack justify="space-between" mb={8}>
          <Tabs.List>
            <Tabs.Trigger
              value="Account"
              color="neutral.800"
              textStyle="p2"
              borderBottom="1px solid"
              borderColor="neutral.100"
              _selected={{ borderColor: 'neutral.700' }}
            >
              Account
            </Tabs.Trigger>
            <Tabs.Trigger
              value="Application"
              color="neutral.800"
              textStyle="p2"
              borderBottom="1px solid"
              borderColor="neutral.100"
              _selected={{ borderColor: 'neutral.700' }}
            >
              Application
            </Tabs.Trigger>
          </Tabs.List>
          {editButton}
        </HStack>

        <Tabs.Content value="Account">{fields}</Tabs.Content>
        <Tabs.Content value="Application">
          {/* TODO: add application tab content */}
          <Box color="neutral.700" fontSize="sm">
            Application details coming soon.
          </Box>
        </Tabs.Content>
      </Tabs.Root>
    );
  } else {
    return (
      <Box mx={2}>
        <HStack justify="space-between" my={4}>
          <Text textStyle="p" fontWeight={600} mb={4}>
            Account Details
          </Text>
          {editButton}
        </HStack>
        {fields}
      </Box>
    );
  }
};

export default ProfileAccountInfo;
