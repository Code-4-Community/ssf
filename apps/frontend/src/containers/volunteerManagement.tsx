import { useEffect, useState } from 'react';
import {
  Table,
  TableCaption,
  Text,
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
  InputGroup,
  Pagination,
  ButtonGroup,
  IconButton
} from '@chakra-ui/react';
import { VolunteerType } from '../types/types';
import { Link } from 'react-router-dom';
import { ChevronDownIcon, SearchIcon, ChevronRight, ChevronLeft } from 'lucide-react';
import { User } from '../types/types';
import ApiClient from '@api/apiClient';

const VolunteerManagement: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [volunteers, setVolunteers] = useState<User[]>([]);
  const [changedVolunteers, setChangedVolunteers] = useState<User[]>([]);
  const [searchName, setSearchName] = useState<string>('');
  const [checkedTypes, setCheckedTypes] = useState<string[]>([]);

  const pageSize = 2;

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

  useEffect(() => {
    setCurrentPage(1);
  }, [searchName, checkedTypes]);

  const filteredVolunteers = changedVolunteers.filter((a) => {
    const fullName = `${a.firstName} ${a.lastName}`.toLowerCase();
    return (
      fullName.includes(searchName.toLowerCase()) &&
      (checkedTypes.includes(a.role.toUpperCase()) || checkedTypes.length === 0)
    );
  });

  const paginatedVolunteers = filteredVolunteers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

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
    <Box flexDirection="column" p={4}>
      <Text fontSize="2xl">Volunteer Management</Text>
      <Box
        mt={5}
        display="block"
        maxW="100%"
        overflowX="auto"
        overflowY="hidden"
        whiteSpace="nowrap"
      >
        <VStack my={2} align="start" >
          <Flex justify="space-between" align="center" w="100%">
            <InputGroup startElement = {<SearchIcon size={15}></SearchIcon>} maxW={300}>
              <Input
                placeholder="Search"
                value={searchName}
                onChange={handleSearchNameChange}
              />
            </InputGroup>
            <Button as={Link} to="/add_volunteer_page" variant="outline">
              + Add
            </Button>
          </Flex>
          <Menu.Root closeOnSelect={true}>
            <Menu.Trigger asChild>
              <Button variant="outline">
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
                        onCheckedChange={(e) =>
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
              <Button onClick={handleReset} variant="outline">Reset unsaved changes</Button>
              <Button onClick={handleSaveChanges} variant="outline">Save changes</Button>
            </Flex>
          </TableCaption>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>Volunteer</Table.ColumnHeader>
              <Table.ColumnHeader>Type</Table.ColumnHeader>
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
                  {volunteerTypeDropdown({
                    volunteerType:
                      VolunteerType[
                        volunteer.role.toUpperCase() as keyof typeof VolunteerType
                      ],
                    volunteerId: volunteer.id,
                  })}
                </Table.Cell>
                <Table.Cell>
                  {volunteer.email}
                </Table.Cell>
                <Table.Cell textAlign="right">
                  <Button textDecoration="underline" color="black" as={Link} to={`/pantry-management/${volunteer.id}`}>
                    View assigned pantries
                  </Button>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      
      <Pagination.Root count={Math.ceil(filteredVolunteers.length / pageSize)} pageSize={1} page={currentPage} onChange={(page) => setCurrentPage(page)}>
        <ButtonGroup variant="ghost" size="sm">
          <Pagination.PrevTrigger asChild>
            <IconButton onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}>
              <ChevronLeft />
            </IconButton>
          </Pagination.PrevTrigger>

          <Pagination.Items
            render={(page) => (
              <IconButton
                variant={page.isCurrent ? 'outline' : 'ghost'}
                onClick={() => setCurrentPage(page.value)}
              >
                {page.value}
              </IconButton>
            )}
          />

          <Pagination.NextTrigger asChild>
            <IconButton onClick={() => setCurrentPage((prev) => Math.min(prev + 1, Math.ceil(filteredVolunteers.length / pageSize)))}>
              <ChevronRight />
            </IconButton>
          </Pagination.NextTrigger>
        </ButtonGroup>
      </Pagination.Root>
      </Box>
    </Box>
  );
};

export default VolunteerManagement;
