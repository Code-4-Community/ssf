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

const VolunteerManagement: React.FC = () => {
  // const [assignments, setAssignments] = useState();

  // useEffect(() => {
  //     const fetchAssignments = async () => {
  //         try {
  //             const response = await fetch("api/assignments/getAll", {
  //                 method: "GET",
  //                 headers: {
  //                     "Content-Type": "application/json"
  //                 }
  //             });

  //             if (response.ok) {
  //                 const data = await response.json();
  //                 setAssignments(data);
  //                 console.log("Assignments: ", data);
  //             } else {
  //                 console.error("Error fetching assignments: ", await response.text());
  //             }
  //         } catch (error) {
  //             console.error("Error fetching assignments: ", error);
  //         }
  //     }

  //     fetchAssignments();
  // }, []);

  const volunteerTypeDropdown = () => {
    return (
      <Select>
        <option value={VolunteerType.LEADVOLUNTEER}>Lead Volunteer</option>
        <option value={VolunteerType.STANDARDVOLUNTEER}>
          Standard Volunteer
        </option>
        <option value={VolunteerType.NONPANTRYVOLUNTEER}>
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
            <Tr>
              <Td>inches</Td>
              <Td>millimetres (mm)</Td>
              <Td isNumeric>25.4</Td>
            </Tr>
            <Tr>
              <Td>feet</Td>
              <Td>{volunteerTypeDropdown()}</Td>
              <Td isNumeric>30.48</Td>
            </Tr>
            <Tr>
              <Td>yards</Td>
              <Td>metres (m)</Td>
              <Td isNumeric>0.91444</Td>
            </Tr>
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
