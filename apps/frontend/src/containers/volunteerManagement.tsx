import { useEffect, useState } from 'react';
import {
  Table,
  Thead,
  Tbody,
  Tfoot,
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
} from '@chakra-ui/react';
import { VolunteerType } from '../types/types';
import { AssignmentWithRelations } from '../types/types';

const VolunteerManagement: React.FC = () => {
  const [assignments, setAssignments] = useState<
    AssignmentWithRelations[] | null
  >(null);

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
          console.log('Assignments: ', data);
        } else {
          console.error('Error fetching assignments: ', await response.text());
        }
      } catch (error) {
        console.error('Error fetching assignments: ', error);
      }
    };

    fetchAssignments();
  }, []);

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

  return (
    <Center flexDirection="column" p={4}>
      <Text>Pantry Volunteer Management</Text>
      <TableContainer mt={5}>
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
            {assignments?.map((assignment) => (
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
          <Tfoot>
            <Tr>
              <Th>To convert</Th>
              <Th>into</Th>
              <Th isNumeric>multiply by</Th>
            </Tr>
          </Tfoot>
        </Table>
      </TableContainer>
    </Center>
  );
};

export default VolunteerManagement;
