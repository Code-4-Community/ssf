import { useEffect, useState } from 'react';
import {
  Table,
  TableCaption,
  Text,
  Center,
  Button,
  Flex,
  Input,
  VStack,
  Box,
} from '@chakra-ui/react';
import { Link } from 'react-router-dom';
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

  const handleSearchNameChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setSearchName(event.target.value);
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
