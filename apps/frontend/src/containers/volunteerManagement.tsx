import { useEffect, useState } from 'react';
import {
  Table,
  Text,
  Button,
  Flex,
  Input,
  VStack,
  Box,
  InputGroup,
  Pagination,
  ButtonGroup,
  IconButton,
  Alert
} from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { SearchIcon, ChevronRight, ChevronLeft } from 'lucide-react';
import { User } from '../types/types';
import ApiClient from '@api/apiClient';
import NewVolunteerModal from '@components/forms/addNewVolunteerModal';

const VolunteerManagement: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [volunteers, setVolunteers] = useState<User[]>([]);
  const [searchName, setSearchName] = useState<string>('');

  const [alertMessage, setAlertMessage] = useState<string>('');

  const pageSize = 8;

  useEffect(() => {
    const fetchVolunteers = async () => {
      try {
        const allVolunteers = await ApiClient.getVolunteers();
        setVolunteers(allVolunteers);
      } catch (error) {
        alert('Error fetching volunteers');
        console.error('Error fetching volunteers: ', error);
      }
    };

    fetchVolunteers();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchName]);

  const filteredVolunteers = volunteers.filter((a) => {
    const fullName = `${a.firstName} ${a.lastName}`.toLowerCase();
    return (fullName.includes(searchName.toLowerCase()));
  });

  const paginatedVolunteers = filteredVolunteers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleSearchNameChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setSearchName(event.target.value);
  };

  return (
    <Box flexDirection="column" p={4}>
      <Text fontSize="3xl">Volunteer Management</Text>
      {alertMessage && (
        <Alert.Root status="info">
          <Alert.Indicator />
          <Alert.Title>{alertMessage}</Alert.Title>
        </Alert.Root>
      )}
      <Box
        mt={5}
        display="block"
        maxW="100%"
        overflowX="auto"
        overflowY="hidden"
        whiteSpace="nowrap"
      >
        <VStack mt={2} mb={7} align="start" >
          <Flex justify="space-between" align="center" w="100%">
            <InputGroup startElement = {<SearchIcon size={15}></SearchIcon>} maxW={300}>
              <Input
                placeholder="Search"
                value={searchName}
                onChange={handleSearchNameChange}
              />
            </InputGroup>
            <NewVolunteerModal onSubmitSuccess={() => {
                setAlertMessage("Volunteer added");
                setTimeout(() => setAlertMessage(""), 3000);
              }}
            />
          </Flex>
        </VStack>
        <Table.Root variant="line">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>Volunteer</Table.ColumnHeader>
              <Table.ColumnHeader>Email</Table.ColumnHeader>
              <Table.ColumnHeader textAlign="right">Actions</Table.ColumnHeader>
            </Table.Row> 
          </Table.Header>
          <Table.Body>
            {paginatedVolunteers?.map((volunteer) => (
              <Table.Row key={volunteer.id}>
                <Table.Cell>
                  {volunteer.firstName} {volunteer.lastName}
                </Table.Cell>
                <Table.Cell>
                  {volunteer.email}
                </Table.Cell>
                <Table.Cell textAlign="right">
                  <Button textDecoration="underline" color="gray" as={Link} to={`/pantry-management/${volunteer.id}`}>
                    View assigned pantries
                  </Button>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
        <Flex justify="center" mt={4}>
          <Pagination.Root count={Math.ceil(filteredVolunteers.length / pageSize)} pageSize={1} page={currentPage} onChange={(page) => setCurrentPage(page)}>
            <ButtonGroup variant="outline" size="sm">
              <Pagination.PrevTrigger asChild>
                <IconButton variant="ghost" onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}>
                  <ChevronLeft />
                </IconButton>
              </Pagination.PrevTrigger>

              <Pagination.Items
                render={(page) => (
                  <IconButton
                    variant={{ base: "outline", _selected: "outline" }}
                    onClick={() => setCurrentPage(page.value)}
                  >
                    {page.value}
                  </IconButton>
                )}
              />

              <Pagination.NextTrigger asChild>
                <IconButton variant="ghost" onClick={() => setCurrentPage((prev) => Math.min(prev + 1, Math.ceil(filteredVolunteers.length / pageSize)))}>
                  <ChevronRight />
                </IconButton>
              </Pagination.NextTrigger>
            </ButtonGroup>
          </Pagination.Root>
        </Flex>
      </Box>
    </Box>
  );
};

export default VolunteerManagement;
