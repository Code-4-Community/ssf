import { useEffect, useState } from 'react';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer,
  Text,
  Center,
  Select,
  Button,
  Flex,
  Input,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Checkbox,
  VStack,
} from '@chakra-ui/react';
import { VolunteerType } from '../types/types';
import { Link } from 'react-router-dom';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { User } from '../types/types';
import ApiClient from '@api/apiClient';

const VolunteerManagement: React.FC = () => {
  const [volunteers, setVolunteers] = useState<User[]>([]);
  const [changedVolunteers, setChangedVolunteers] = useState<User[]>([]);
  const [searchName, setSearchName] = useState<string>('');
  const [checkedTypes, setCheckedTypes] = useState<string[]>([
    'LEAD_VOLUNTEER',
    'STANDARD_VOLUNTEER',
  ]);

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
      checkedTypes.includes(a.role.toUpperCase())
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
      <Select
        key={volunteerId}
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
      </Select>
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
    setCheckedTypes(['LEAD_VOLUNTEER', 'STANDARD_VOLUNTEER']);

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
      <TableContainer mt={5}>
        <VStack my={5}>
          <Input
            placeholder="Search by volunteer name"
            value={searchName}
            onChange={handleSearchNameChange}
          />
          <Menu closeOnSelect={false}>
            <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
              Filter by Volunteer Type
            </MenuButton>
            <MenuList>
              {Object.values(VolunteerType).map((volunteerType) => (
                <MenuItem key={volunteerType}>
                  <Checkbox
                    isChecked={checkedTypes.includes(
                      volunteerType.toUpperCase(),
                    )}
                    onChange={(e) =>
                      handleVolunteerFilterChange(
                        volunteerType,
                        e.target.checked,
                      )
                    }
                  >
                    {DISPLAY_VOLUNTEER_TYPES[volunteerType.toUpperCase()] ||
                      volunteerType}
                  </Checkbox>
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
        </VStack>
        <Table variant="simple">
          <TableCaption>
            <Flex justifyContent="space-between" width="100%">
              <Button onClick={handleReset}>Reset unsaved changes</Button>
              <Button as={Link} to="/add_volunteer_page">
                Add a new volunteer
              </Button>
              <Button onClick={handleSaveChanges}>Save changes</Button>
            </Flex>
          </TableCaption>
          <Thead>
            <Tr>
              <Th>Volunteer Name</Th>
              <Th>Email</Th>
              <Th>Phone</Th>
              <Th>Type</Th>
              <Th>Assigned Pantries</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredVolunteers?.map((volunteer) => (
              <Tr key={volunteer.id}>
                <Td>
                  {volunteer.firstName} {volunteer.lastName}
                </Td>
                <Td>{volunteer.email}</Td>
                <Td>{volunteer.phone}</Td>
                <Td>
                  {volunteerTypeDropdown({
                    volunteerType:
                      VolunteerType[
                        volunteer.role.toUpperCase() as keyof typeof VolunteerType
                      ],
                    volunteerId: volunteer.id,
                  })}
                </Td>
                <Td>
                  <Button as={Link} to={`/pantry-management/${volunteer.id}`}>
                    View assigned pantries
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Center>
  );
};

export default VolunteerManagement;
