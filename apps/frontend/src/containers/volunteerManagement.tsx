import { useEffect, useState } from 'react';
import {
  Table,
  TableCaption,
  Text,
  Center,
  Button,
  Flex,
  Input,
  Menu,
  Checkbox,
  VStack,
  Box,
  Portal,
  NativeSelect,
  NativeSelectIndicator,
} from '@chakra-ui/react';
import { VolunteerType } from '../types/types';
import { Link } from 'react-router-dom';
import { ChevronDownIcon } from 'lucide-react';
import { User } from '../types/types';
import ApiClient from '@api/apiClient';

const VolunteerManagement: React.FC = () => {
  const [volunteers, setVolunteers] = useState<User[]>([]);
  const [changedVolunteers, setChangedVolunteers] = useState<User[]>([]);
  const [searchName, setSearchName] = useState<string>('');
  const [checkedTypes, setCheckedTypes] = useState<string[]>([]);

  useEffect(() => {
    const fetchVolunteers = async () => {
      try {
        const allVolunteers = await ApiClient.getVolunteers();
        setVolunteers(allVolunteers);
        setChangedVolunteers(allVolunteers);
      } catch (error) {
        alert('Error fetching volunteers');
        console.error('Error fetching volunteers: ', error);
      }
    };

    fetchVolunteers();
  }, []);

  const filteredVolunteers = changedVolunteers.filter((a) => {
    const fullName = `${a.firstName} ${a.lastName}`.toLowerCase();
    return (
      fullName.includes(searchName.toLowerCase()) &&
      (checkedTypes.includes(a.role.toUpperCase()) || checkedTypes.length === 0)
    );
  });

  const volunteerTypeDropdown = ({
    volunteerType,
    volunteerId,
  }: {
    volunteerType: VolunteerType;
    volunteerId: number;
  }) => {
    return (
      <NativeSelect.Root>
        <NativeSelect.Field
          value={volunteerType}
          onChange={(e) =>
            handleVolunteerTypeChange(
              e.target.value as VolunteerType,
              volunteerId,
            )
          }
        >
          {Object.entries(DISPLAY_VOLUNTEER_TYPES).map(([key, label]) => (
            <option value={VolunteerType[key as keyof typeof VolunteerType]}>
              {label}
            </option>
          ))}
        </NativeSelect.Field>
        <NativeSelectIndicator />
      </NativeSelect.Root>
    );
  };

  const handleSearchNameChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setSearchName(event.target.value);
  };

  const handleVolunteerFilterChange = (type: string, checked: boolean) => {
    if (checked) {
      setCheckedTypes([...checkedTypes, type.toUpperCase()]);
    } else {
      setCheckedTypes(
        checkedTypes.filter(
          (checkedType) => checkedType !== type.toUpperCase(),
        ),
      );
    }
  };

  const handleReset = () => {
    setSearchName('');
    setCheckedTypes([]);

    setChangedVolunteers(volunteers);
  };

  const handleSaveChanges = async () => {
    try {
      await Promise.all(
        changedVolunteers.map((volunteer) =>
          ApiClient.updateUserVolunteerRole(volunteer.id, {
            role: String(volunteer.role),
          }),
        ),
      );
      setVolunteers(changedVolunteers);
      alert('successful save!');
    } catch (error) {
      alert('Error updating volunteer type');
      console.error('Error updating volunteer type: ', error);
    }
  };

  const handleVolunteerTypeChange = (
    type: VolunteerType,
    volunteerId: number,
  ) => {
    setChangedVolunteers((prev) =>
      prev.map((a) => (a.id === volunteerId ? { ...a, role: type } : a)),
    );
  };

  const DISPLAY_VOLUNTEER_TYPES: Record<string, string> = {
    LEAD_VOLUNTEER: 'Lead Volunteer',
    STANDARD_VOLUNTEER: 'Standard Volunteer',
  };

  return (
    <Center flexDirection="column" p={4}>
      <Text fontSize="2xl">Pantry Volunteer Management</Text>
      <Box
        mt={5}
        display="block"
        maxW="100%"
        overflowX="auto"
        overflowY="hidden"
        whiteSpace="nowrap"
      >
        <VStack my={5}>
          <Input
            placeholder="Search by volunteer name"
            value={searchName}
            onChange={handleSearchNameChange}
          />
          <Menu.Root closeOnSelect={false}>
            <Menu.Trigger asChild>
              <Button>
                Filter by Volunteer Type
                <ChevronDownIcon />
              </Button>
            </Menu.Trigger>
            <Portal>
              <Menu.Positioner>
                <Menu.Content>
                  {Object.values(VolunteerType).map((volunteerType) => (
                    <Menu.Item key={volunteerType}>
                      <Checkbox.Root
                        checked={checkedTypes.includes(
                          volunteerType.toUpperCase(),
                        )}
                        onCheckedChange={(e: { checked: boolean }) =>
                          handleVolunteerFilterChange(volunteerType, e.checked)
                        }
                      >
                        <Checkbox.HiddenInput />
                        <Checkbox.Control />
                        <Checkbox.Label>
                          {DISPLAY_VOLUNTEER_TYPES[
                            volunteerType.toUpperCase()
                          ] || volunteerType}
                        </Checkbox.Label>
                      </Checkbox.Root>
                    </Menu.Item>
                  ))}
                </Menu.Content>
              </Menu.Positioner>
            </Portal>
          </Menu.Root>
        </VStack>
        <Table.Root variant="line">
          <TableCaption>
            <Flex justifyContent="space-between" width="100%">
              <Button onClick={handleReset}>Reset unsaved changes</Button>
              <Button asChild>
                <Link to="/add_volunteer_page">Add a new volunteer</Link>
              </Button>
              <Button onClick={handleSaveChanges}>Save changes</Button>
            </Flex>
          </TableCaption>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>Volunteer Name</Table.ColumnHeader>
              <Table.ColumnHeader>Email</Table.ColumnHeader>
              <Table.ColumnHeader>Phone</Table.ColumnHeader>
              <Table.ColumnHeader>Type</Table.ColumnHeader>
              <Table.ColumnHeader>Assigned Pantries</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {filteredVolunteers?.map((volunteer) => (
              <Table.Row key={volunteer.id}>
                <Table.Cell>
                  {volunteer.firstName} {volunteer.lastName}
                </Table.Cell>
                <Table.Cell>{volunteer.email}</Table.Cell>
                <Table.Cell>{volunteer.phone}</Table.Cell>
                <Table.Cell>
                  {volunteerTypeDropdown({
                    volunteerType:
                      VolunteerType[
                        volunteer.role.toUpperCase() as keyof typeof VolunteerType
                      ],
                    volunteerId: volunteer.id,
                  })}
                </Table.Cell>
                <Table.Cell>
                  <Button asChild>
                    <Link to={`/pantry-management/${volunteer.id}`}>
                      View assigned pantries
                    </Link>
                  </Button>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Box>
    </Center>
  );
};

export default VolunteerManagement;
