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
import { Role, UpdateProfileFields, User } from '../../types/types';
import EditablePantryApplication from '@components/forms/editablePantryApplication';
import EditableFMApplication from '@components/forms/editableFMApplication';

interface ProfileAccountInfoProps {
  profile: User;
  showTabs: boolean;
  onSave: (fields: UpdateProfileFields) => Promise<boolean>;
}

type ProfileFieldProps =
  | {
      label: string;
      value: string;
    }
  | {
      label: string;
      value: string;
      name: string;
      isEditing: boolean;
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    };

const labelStyles = {
  fontSize: '14px',
  fontWeight: 600,
  fontFamily: 'inter',
  color: 'neutral.800',
};

const ProfileField: React.FC<ProfileFieldProps> = (props) => (
  <Box>
    <Text {...labelStyles} mb={1}>
      {props.label}
    </Text>
    {'name' in props && props.isEditing ? (
      <Input
        name={props.name}
        value={props.value}
        onChange={props.onChange}
        size="sm"
        borderRadius="md"
        width="3/4"
        color="neutral.600"
        borderColor="neutral.100"
      />
    ) : (
      <Text color="neutral.800" textStyle="p2">
        {props.value}
      </Text>
    )}
  </Box>
);

const ProfileAccountInfo: React.FC<ProfileAccountInfoProps> = ({
  profile,
  showTabs,
  onSave,
}) => {
  const { firstName, lastName, email, phone } = profile;
  const [activeTab, setActiveTab] = useState('Account');
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingApplication, setIsEditingApplication] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({ firstName, lastName, phone });

  const isCurrentlyEditing =
    activeTab === 'Account' ? isEditing : isEditingApplication;
  const toggleCurrentEditing = () => {
    if (activeTab === 'Account') {
      setIsEditing((e) => !e);
    } else {
      setIsEditingApplication((e) => !e);
    }
  };

  useEffect(() => {
    setForm({ firstName, lastName, phone });
  }, [firstName, lastName, phone]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleCancel = () => {
    setForm({ firstName, lastName, phone });
    setIsEditing(false);
  };

  const handleSave = async () => {
    const changed: UpdateProfileFields = {};
    if (form.firstName !== firstName) changed.firstName = form.firstName;
    if (form.lastName !== lastName) changed.lastName = form.lastName;
    if (form.phone !== phone) changed.phone = form.phone;

    if (Object.keys(changed).length === 0) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    const success = await onSave(changed);
    setIsSaving(false);
    if (success) setIsEditing(false);
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
      onClick={toggleCurrentEditing}
    >
      <Pencil size={14} />
      <Text fontWeight={600} fontFamily="ibm">
        {isCurrentlyEditing ? 'Editing' : 'Edit'}
      </Text>
    </HStack>
  );

  const fields = (
    <Box>
      <SimpleGrid columns={2} gapY={12}>
        <ProfileField
          label="First Name"
          name="firstName"
          value={form.firstName}
          isEditing={isEditing}
          onChange={handleChange}
        />
        <ProfileField
          label="Last Name"
          name="lastName"
          value={form.lastName}
          isEditing={isEditing}
          onChange={handleChange}
        />
        <ProfileField label="Email Address" value={email} />
        <ProfileField
          label="Phone Number"
          name="phone"
          value={form.phone}
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
      <Tabs.Root
        defaultValue="Account"
        variant="line"
        mx={2}
        onValueChange={(e: { value: string }) => setActiveTab(e.value)}
      >
        <HStack justify="space-between" mb={8}>
          <Tabs.List>
            <Tabs.Trigger
              value="Account"
              color="neutral.800"
              textStyle="p2"
              borderBottom="0.5px solid"
              borderColor="neutral.100"
              _selected={{ borderColor: 'neutral.700' }}
            >
              Account
            </Tabs.Trigger>
            <Tabs.Trigger
              value="Application"
              color="neutral.800"
              textStyle="p2"
              borderBottom="0.5px solid"
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
          {profile.role === Role.FOODMANUFACTURER ? (
            <EditableFMApplication
              isEditing={isEditingApplication}
              onEditingChange={setIsEditingApplication}
            />
          ) : (
            <EditablePantryApplication
              isEditing={isEditingApplication}
              onEditingChange={setIsEditingApplication}
            />
          )}
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
