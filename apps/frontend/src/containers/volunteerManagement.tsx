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
import { VolunteerPantryAssignment } from '../types/types';
import { Link } from 'react-router-dom';
import { ChevronDownIcon } from '@chakra-ui/icons';
import ApiClient from '@api/apiClient';

const VolunteerManagement: React.FC = () => {
  const [assignments, setAssignments] = useState<VolunteerPantryAssignment[]>(
    [],
  );
  const [changedAssignments, setChangedAssignments] = useState<
    VolunteerPantryAssignment[]
  >([]);
  const [searchName, setSearchName] = useState<string>('');
  const [checkedTypes, setCheckedTypes] = useState<string[]>([
    'LEAD_VOLUNTEER',
    'STANDARD_VOLUNTEER',
  ]);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const allAssignments = await ApiClient.getAllAssignments();
        const seen = new Set();
        // Filters assignments for 1 row per user
        const uniqueUserAssignments = allAssignments.filter((assignment) => {
          if (seen.has(assignment.volunteer.id)) {
            return false;
          }
          seen.add(assignment.volunteer.id);
          return true;
        });
        setAssignments(uniqueUserAssignments);
        setChangedAssignments(uniqueUserAssignments);
      } catch (error) {
        console.error('Error fetching assignments: ', error);
      }
    };

    fetchAssignments();
  }, []);

  const filteredAssignments = changedAssignments.filter(
    (a) =>
      a.volunteer.firstName.toLowerCase().includes(searchName.toLowerCase()) &&
      checkedTypes.includes(a.volunteer.role.toUpperCase()),
  );

  const volunteerTypeDropdown = ({
    volunteerType,
    assignmentId,
  }: {
    volunteerType: VolunteerType;
    assignmentId: number;
  }) => {
    return (
      <Select
        key={`${assignmentId}`}
        value={volunteerType}
        onChange={(e) =>
          handleVolunteerTypeChange(
            e.target.value as VolunteerType,
            assignmentId,
          )
        }
      >
        {Object.entries(VOLUNTEER_TYPES).map(([key, label]) => (
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

    setChangedAssignments(assignments);
  };

  const handleSaveChanges = async () => {
    try {
      await Promise.all(
        changedAssignments.map((assignment) =>
          ApiClient.updateUserVolunteerRole(assignment.volunteer.id, {
            role: String(assignment.volunteer.role),
          }),
        ),
      );
      setAssignments(changedAssignments);
      alert('successful save!');
    } catch (error) {
      console.error('Error updating volunteer type: ', error);
    }
  };

  const handleVolunteerTypeChange = (
    type: VolunteerType,
    assignmentId: number,
  ) => {
    setChangedAssignments((prev) =>
      prev.map((a) =>
        a.assignmentId === assignmentId
          ? { ...a, volunteer: { ...a.volunteer, role: type } }
          : a,
      ),
    );
  };

  const VOLUNTEER_TYPES: Record<string, string> = {
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
                    {VOLUNTEER_TYPES[volunteerType.toUpperCase()] ||
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
            {filteredAssignments?.map((assignment) => (
              <Tr key={assignment.assignmentId}>
                <Td>
                  {assignment.volunteer.firstName}{' '}
                  {assignment.volunteer.lastName}
                </Td>
                <Td>{assignment.volunteer.email}</Td>
                <Td>{assignment.volunteer.phone}</Td>
                <Td>
                  {volunteerTypeDropdown({
                    volunteerType:
                      VolunteerType[
                        assignment.volunteer.role.toUpperCase() as keyof typeof VolunteerType
                      ],
                    assignmentId: assignment.assignmentId,
                  })}
                </Td>
                <Td>
                  {assignment.pantry && (
                    <Button
                      as={Link}
                      to={`/pantry-management/${assignment.volunteer.id}`}
                    >
                      View assigned pantries
                    </Button>
                  )}
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
