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

const VolunteerManagement: React.FC = () => {
  const [assignments, setAssignments] = useState<
    AssignmentWithRelations[] | null
  >(null);

  const [filteredAssignments, setFilteredAssignments] = useState<
    AssignmentWithRelations[]
  >([]);
  const [searchName, setSearchName] = useState<string>('');
  const [checkedTypes, setCheckedTypes] = useState<string[]>([
    'LEAD_VOLUNTEER',
    'STANDARD_VOLUNTEER',
    'NON-PANTRY_VOLUNTEER',
  ]);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const response = await fetch('api/assignments/getAllRelations', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setAssignments(data);
          setFilteredAssignments(data);
        } else {
          console.error('Error fetching assignments: ', await response.text());
        }
      } catch (error) {
        console.error('Error fetching assignments: ', error);
      }
    };

    fetchAssignments();
  }, []);

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
  }: {
    volunteerType: VolunteerType;
  }) => {
    return (
      <Select defaultValue={volunteerType}>
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

  return (
    <Center flexDirection="column" p={4}>
      <Text>Pantry Volunteer Management</Text>
      <TableContainer mt={5}>
        <VStack my={5}>
          <Input
            placeholder="Search by volunteer name"
            onChange={handleSearchNameChange}
          />
          <Menu closeOnSelect={false}>
            <MenuButton as={Button}>Filter by Volunteer Type</MenuButton>
            <MenuList>
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
              <Button>Revert to original</Button>
              <Button>Save changes</Button>
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
                  })}
                </Td>
                <Td>{assignment.pantry.pantryName}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Center>
  );
};

export default VolunteerManagement;
