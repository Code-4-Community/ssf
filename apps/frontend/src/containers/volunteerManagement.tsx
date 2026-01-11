import { useEffect, useState } from 'react';
import {
  Table,
  Text,
  Flex,
  Input,
  VStack,
  Box,
  InputGroup,
  Pagination,
  ButtonGroup,
  IconButton,
  Alert,
  Link,
} from '@chakra-ui/react';
import { SearchIcon, ChevronRight, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { User } from '../types/types';
import ApiClient from '@api/apiClient';
import NewVolunteerModal from '@components/forms/addNewVolunteerModal';

const VolunteerManagement: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [volunteers, setVolunteers] = useState<User[]>([]);
  const [searchName, setSearchName] = useState<string>('');

  const [alertMessage, setAlertMessage] = useState<string>('');
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);

  const pageSize = 8;

  const USER_ICON_COLORS = ['#F89E19', '#CC3538', '#2795A5', '#2B4E60'];

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
  }, [alertMessage]);

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
    <Box flexDirection="column" p={12}>
      <Text textStyle="h1" color="#515151">Volunteer Management</Text>
      {alertMessage && (
        <Alert.Root color={submitSuccess ? "neutral.800" : "red"} status="info" bg="white" variant="subtle" boxShadow="lg"  position="absolute" top="12px" right="12px" w="fit-content" maxW="400px">
          <Alert.Indicator />
          <Alert.Title textStyle="p2" fontWeight={500} >{alertMessage}</Alert.Title>
        </Alert.Root>
      )}
      <Box
        mt={3}
        display="block"
        maxW="100%"
        overflowX="auto"
        overflowY="hidden"
        whiteSpace="nowrap"
      >
        <VStack mt={2} mb={7} align="start" >
          <Flex justify="space-between" align="center" w="100%">
            <InputGroup startElement = {<SearchIcon color="#707070" size={13}></SearchIcon>} maxW={200}>
              <Input
                placeholder="Search"
                value={searchName}
                borderColor="neutral.200"
                ps="8"
                onChange={handleSearchNameChange}
                color="neutral.600"
                fontFamily="ibm"
                fontWeight="semibold"
                fontSize="14px"
                _focusVisible={{ boxShadow: "none", outline: "none" }}
              />
            </InputGroup>
            <NewVolunteerModal onSubmitSuccess={() => {
                setAlertMessage("Volunteer added.");
                setSubmitSuccess(true);
                setTimeout(() => setAlertMessage(""), 3000);
              }} onSubmitFail={() => {
                setAlertMessage("Volunteer could not be added.");
                setSubmitSuccess(false);
                setTimeout(() => setAlertMessage(""), 3000);
              }}
            />
          </Flex>
        </VStack>
        <Table.Root variant="line" showColumnBorder>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader color="neutral.800" textStyle="p2" fontWeight={600}>Volunteer</Table.ColumnHeader>
              <Table.ColumnHeader color="neutral.800" textStyle="p2" fontWeight={600}>Email</Table.ColumnHeader>
              <Table.ColumnHeader color="neutral.800" textStyle="p2" fontWeight={600} textAlign="right">Actions</Table.ColumnHeader>
            </Table.Row> 
          </Table.Header>
          <Table.Body color="neutral.700" fontWeight={400} textStyle="p2">
            {paginatedVolunteers?.map((volunteer) => (
              <Table.Row key={volunteer.id}>
                <Table.Cell>
                  <Box display="flex" alignItems="center" gap={5}>
                    <Box
                        borderRadius="full"
                        bg={USER_ICON_COLORS[volunteer.id % USER_ICON_COLORS.length]}
                        width="33px"
                        height="33px"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        color="white"
                        p={2}
                      >
                        {volunteer.firstName
                          .charAt(0)
                          .toUpperCase()}
                        {volunteer.lastName
                          .charAt(0)
                          .toUpperCase()}
                      </Box>
                    {volunteer.firstName} {volunteer.lastName}
                  </Box>
                </Table.Cell>
                <Table.Cell>
                  {volunteer.email}
                </Table.Cell>
                <Table.Cell textAlign="right">
                  <Link color="neutral.700" fontWeight={400} textStyle="p2" variant="underline" textDecorationColor="neutral.700" href={`/pantry-management/${volunteer.id}`}>
                    View Assigned Pantries
                  </Link>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
        <Flex justify="center" mt={12}>
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
