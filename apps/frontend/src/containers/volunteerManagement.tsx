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
import { AssignmentWithRelations } from '../types/types';
import { Link } from 'react-router-dom';
import { ChevronDownIcon } from '@chakra-ui/icons';
import ApiClient from '@api/apiClient';

const VolunteerManagement: React.FC = () => {
  const [assignments, setAssignments] = useState<AssignmentWithRelations[]>([]);
  const [filteredAssignments, setFilteredAssignments] = useState<
    AssignmentWithRelations[]
  >([]);
  const [changedAssignments, setChangedAssignments] = useState<
    AssignmentWithRelations[]
  >([]);
  const [searchName, setSearchName] = useState<string>('');
  const [checkedTypes, setCheckedTypes] = useState<string[]>([
    'LEAD_VOLUNTEER',
    'STANDARD_VOLUNTEER',
    'NON_PANTRY_VOLUNTEER',
  ]);
  const [resetKey, setResetKey] = useState<number>(0);

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
        setFilteredAssignments(uniqueUserAssignments);
        setChangedAssignments(uniqueUserAssignments);
      } catch (error) {
        console.error('Error fetching assignments: ', error);
      }
    };

    fetchAssignments();
  }, [resetKey]);

  useEffect(() => {
    if (!assignments) return;

    const filtered = assignments.filter(
      (assignment) =>
        assignment.volunteer.firstName
          .toLowerCase()
          .includes(searchName.toLowerCase()) &&
        checkedTypes.includes(assignment.volunteerType.toUpperCase()),
    );

    setFilteredAssignments(filtered);
  }, [searchName, checkedTypes, assignments]);

  const volunteerTypeDropdown = ({
    volunteerType,
    assignmentId,
  }: {
    volunteerType: VolunteerType;
    assignmentId: number;
  }) => {
    return (
      <Select
        key={`${assignmentId}-${resetKey}`}
        value={volunteerType}
        onChange={(e) =>
          handleVolunteerTypeChange(
            e.target.value as VolunteerType,
            assignmentId,
          )
        }
      >
        <option value={VolunteerType.LEAD_VOLUNTEER}>Lead Volunteer</option>
        <option value={VolunteerType.STANDARD_VOLUNTEER}>
          Standard Volunteer
        </option>
        <option value={VolunteerType.NON_PANTRY_VOLUNTEER}>
          Non-Pantry Volunteer
        </option>
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
    setCheckedTypes([
      'LEAD_VOLUNTEER',
      'STANDARD_VOLUNTEER',
      'NON_PANTRY_VOLUNTEER',
    ]);
    setResetKey((prev) => prev + 1);
  };

  const handleSaveChanges = async () => {
    try {
      await Promise.all(
        changedAssignments.map((assignment) =>
          ApiClient.updateVolunteerTypeAssignment(assignment.volunteer.id, {
            volunteerType: assignment.volunteerType,
          }),
        ),
      );
      setAssignments(changedAssignments);
    } catch (error) {
      console.error('Error updating volunteer type: ', error);
    }
  };

  const handleVolunteerTypeChange = (
    type: VolunteerType,
    assignmentId: number,
  ) => {
    const updatedAssignments = changedAssignments.map((assignment) => {
      if (assignment.assignmentId === assignmentId) {
        assignment.volunteerType = type;
      }
      return assignment;
    });

    setChangedAssignments(updatedAssignments);
  };

  return (
    <Center flexDirection="column" p={4}>
      <Text fontSize="2xl">Pantry Volunteer Management</Text>
      <TableContainer mt={5}>
        <VStack my={5}>
          <Input
            placeholder="Search by volunteer name"
            onChange={handleSearchNameChange}
            key={resetKey}
          />
          <Menu closeOnSelect={false}>
            <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
              Filter by Volunteer Type
            </MenuButton>
            <MenuList key={resetKey}>
              {Object.values(VolunteerType).map((volunteerType) => (
                <MenuItem key={volunteerType}>
                  <Checkbox
                    defaultChecked
                    onChange={(e) =>
                      handleVolunteerFilterChange(
                        volunteerType,
                        e.target.checked,
                      )
                    }
                  >
                    {volunteerType}
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
              <Th>Volunteer Type</Th>
              <Th>Assigned Pantries</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredAssignments?.map((assignment) => (
              <Tr key={assignment.assignmentId}>
                <Td>{assignment.volunteer.firstName}</Td>
                <Td>
                  {volunteerTypeDropdown({
                    volunteerType:
                      VolunteerType[
                        assignment.volunteerType.toUpperCase() as keyof typeof VolunteerType
                      ],
                    assignmentId: assignment.assignmentId,
                  })}
                </Td>
                <Td>
                  <Button
                    as={Link}
                    // User id
                    to={`/pantry-management/${assignment.volunteer.id}`}
                  >
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
