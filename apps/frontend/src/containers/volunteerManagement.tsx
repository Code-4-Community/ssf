import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../routes';
import {
  Table,
  Text,
  Flex,
  Input,
  VStack,
  Box,
  Badge,
  InputGroup,
  Pagination,
  ButtonGroup,
  IconButton,
  Link,
  Menu,
  Portal,
} from '@chakra-ui/react';
import {
  SearchIcon,
  ChevronRight,
  ChevronLeft,
  EllipsisVertical,
} from 'lucide-react';
import { AlertStatus, Role, User } from '../types/types';
import ApiClient from '@api/apiClient';
import NewVolunteerModal from '@components/forms/addNewVolunteerModal';
import PromoteVolunteerModal from '@components/forms/promoteVolunteerModal';
import ConfirmActionModal from '@components/forms/confirmActionModal';
import { FloatingAlert } from '@components/floatingAlert';
import { useAlert } from '../hooks/alert';
import { getInitials, USER_ICON_COLORS } from '@utils/utils';

const VolunteerManagement: React.FC = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [volunteers, setVolunteers] = useState<User[]>([]);
  const [searchName, setSearchName] = useState<string>('');
  const [selectedVolunteer, setSelectedVolunteer] = useState<User | null>(null);
  const [isPromoteModalOpen, setIsPromoteModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const [alertState, setAlertMessage] = useAlert();

  const pageSize = 8;

  const fetchVolunteers = async () => {
    try {
      const allVolunteers = await ApiClient.getVolunteers();
      setVolunteers(allVolunteers);
    } catch {
      setAlertMessage('Error fetching volunteers', AlertStatus.ERROR);
    }
  };

  useEffect(() => {
    fetchVolunteers();
  }, [setAlertMessage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchName]);

  const handlePromote = async () => {
    if (!selectedVolunteer) return;

    try {
      await ApiClient.promoteVolunteerToAdmin(selectedVolunteer.id);
      setAlertMessage(
        `${selectedVolunteer.firstName} ${selectedVolunteer.lastName} has been promoted to admin.`,
        AlertStatus.INFO,
      );
      fetchVolunteers(); // Refresh list - promoted user will disappear
    } catch {
      setAlertMessage(
        'Failed to promote volunteer to admin.',
        AlertStatus.ERROR,
      );
    }
  };

  const handleToggleActive = async () => {
    if (!selectedVolunteer) return;

    const wasActive = selectedVolunteer.active;
    const fullName = `${selectedVolunteer.firstName} ${selectedVolunteer.lastName}`;
    try {
      if (wasActive) {
        await ApiClient.deactivateUser(selectedVolunteer.id);
      } else {
        await ApiClient.reactivateUser(selectedVolunteer.id);
      }
      setAlertMessage(
        `${fullName} has been ${wasActive ? 'deactivated' : 'activated'}.`,
        AlertStatus.INFO,
      );
      fetchVolunteers();
    } catch {
      setAlertMessage(
        `Failed to ${wasActive ? 'deactivate' : 'activate'} user.`,
        AlertStatus.ERROR,
      );
    }
  };

  const filteredVolunteers = volunteers
    .filter((a) => {
      const fullName = `${a.firstName} ${a.lastName}`.toLowerCase();
      return fullName.includes(searchName.toLowerCase());
    })
    // Deactivated users sort to the bottom of the list.
    .sort((a, b) => Number(b.active) - Number(a.active));

  const paginatedVolunteers = filteredVolunteers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const handleSearchNameChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setSearchName(event.target.value);
  };

  return (
    <Box flexDirection="column" p={12}>
      <Text textStyle="h1" color="gray.light">
        User Management
      </Text>
      {alertState && (
        <FloatingAlert
          key={alertState.id}
          message={alertState.message}
          status={alertState.status}
          timeout={6000}
        />
      )}

      <Box
        mt={3}
        display="block"
        maxW="100%"
        overflowX="auto"
        overflowY="hidden"
        whiteSpace="nowrap"
      >
        <VStack mt={2} mb={7} align="start">
          <Flex justify="space-between" align="center" w="100%">
            <InputGroup
              startElement={
                <SearchIcon
                  color="var(--chakra-colors-neutral-600)"
                  size={13}
                ></SearchIcon>
              }
              maxW={200}
            >
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
                _focusVisible={{ boxShadow: 'none', outline: 'none' }}
              />
            </InputGroup>
            <NewVolunteerModal
              onSubmitSuccess={() => {
                setAlertMessage('User added.', AlertStatus.INFO);
              }}
              onSubmitFail={() => {
                setAlertMessage('User could not be added.', AlertStatus.ERROR);
              }}
            />
          </Flex>
        </VStack>
        <Table.Root variant="line" showColumnBorder>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader
                color="neutral.800"
                textStyle="p2"
                fontWeight={600}
              >
                Users
              </Table.ColumnHeader>
              <Table.ColumnHeader
                color="neutral.800"
                textStyle="p2"
                fontWeight={600}
              >
                Status
              </Table.ColumnHeader>
              <Table.ColumnHeader
                color="neutral.800"
                textStyle="p2"
                fontWeight={600}
              >
                Email
              </Table.ColumnHeader>
              <Table.ColumnHeader
                color="neutral.800"
                textStyle="p2"
                fontWeight={600}
                textAlign="right"
              >
                Actions
              </Table.ColumnHeader>
              <Table.ColumnHeader width="50px" />
            </Table.Row>
          </Table.Header>
          <Table.Body color="neutral.700" fontWeight={400} textStyle="p2">
            {paginatedVolunteers?.map((volunteer) => (
              <Table.Row key={volunteer.id}>
                <Table.Cell>
                  <Box display="flex" alignItems="center" gap={5}>
                    <Box
                      borderRadius="full"
                      bg={
                        volunteer.active
                          ? USER_ICON_COLORS[
                              volunteer.id % USER_ICON_COLORS.length
                            ]
                          : 'neutral.300'
                      }
                      opacity={volunteer.active ? 1 : 0.6}
                      width="33px"
                      height="33px"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      color="white"
                      p={2}
                    >
                      {getInitials(volunteer.firstName, volunteer.lastName)}
                    </Box>
                    {volunteer.firstName} {volunteer.lastName}
                  </Box>
                </Table.Cell>
                <Table.Cell>
                  <Badge
                    py={1}
                    px={2}
                    borderRadius="md"
                    textStyle="p2"
                    fontWeight={500}
                    fontSize="12px"
                    bg={volunteer.active ? 'teal.200' : 'neutral.300'}
                    color={volunteer.active ? 'teal.hover' : 'black'}
                  >
                    {volunteer.active ? 'Active' : 'Deactivated'}
                  </Badge>
                </Table.Cell>
                <Table.Cell>{volunteer.email}</Table.Cell>
                <Table.Cell textAlign="right">
                  {volunteer.role === Role.VOLUNTEER && (
                    <Link
                      color="neutral.700"
                      fontWeight={400}
                      textStyle="p2"
                      variant="underline"
                      textDecorationColor="neutral.700"
                      cursor="pointer"
                      onClick={() =>
                        navigate(
                          `${ROUTES.PANTRY_MANAGEMENT}?volunteerId=${volunteer.id}`,
                        )
                      }
                    >
                      View Assigned Pantries
                    </Link>
                  )}
                </Table.Cell>
                <Table.Cell>
                  <Menu.Root>
                    <Menu.Trigger asChild>
                      <IconButton
                        variant="ghost"
                        size="sm"
                        aria-label="More actions"
                      >
                        <EllipsisVertical size={18} />
                      </IconButton>
                    </Menu.Trigger>
                    <Portal>
                      <Menu.Positioner>
                        <Menu.Content>
                          {volunteer.role === Role.VOLUNTEER && (
                            <Menu.Item
                              value="promote"
                              onClick={() => {
                                setSelectedVolunteer(volunteer);
                                setIsPromoteModalOpen(true);
                              }}
                            >
                              Promote to Admin
                            </Menu.Item>
                          )}
                          <Menu.Item
                            value="toggle-active"
                            onClick={() => {
                              setSelectedVolunteer(volunteer);
                              setIsConfirmModalOpen(true);
                            }}
                          >
                            {volunteer.active ? 'Deactivate' : 'Activate'}
                          </Menu.Item>
                        </Menu.Content>
                      </Menu.Positioner>
                    </Portal>
                  </Menu.Root>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
        <Flex justify="center" mt={12}>
          <Pagination.Root
            count={Math.ceil(filteredVolunteers.length / pageSize)}
            pageSize={1}
            page={currentPage}
            onChange={(page: number) => setCurrentPage(page)}
          >
            <ButtonGroup variant="outline" size="sm" gap={4}>
              <Pagination.PrevTrigger asChild>
                <IconButton
                  variant="ghost"
                  disabled={currentPage === 1}
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                >
                  <ChevronLeft />
                </IconButton>
              </Pagination.PrevTrigger>

              <Pagination.Items
                render={(page) => (
                  <IconButton
                    variant={{ base: 'outline', _selected: 'outline' }}
                    onClick={() => setCurrentPage(page.value)}
                  >
                    {page.value}
                  </IconButton>
                )}
              />

              <Pagination.NextTrigger asChild>
                <IconButton
                  variant="ghost"
                  disabled={
                    currentPage ===
                    Math.ceil(filteredVolunteers.length / pageSize)
                  }
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.min(
                        prev + 1,
                        Math.ceil(filteredVolunteers.length / pageSize),
                      ),
                    )
                  }
                >
                  <ChevronRight />
                </IconButton>
              </Pagination.NextTrigger>
            </ButtonGroup>
          </Pagination.Root>
        </Flex>
      </Box>

      {selectedVolunteer && (
        <PromoteVolunteerModal
          isOpen={isPromoteModalOpen}
          onClose={() => {
            setIsPromoteModalOpen(false);
            setSelectedVolunteer(null);
          }}
          onConfirm={handlePromote}
          volunteerName={`${selectedVolunteer.firstName} ${selectedVolunteer.lastName}`}
        />
      )}

      {selectedVolunteer && (
        <ConfirmActionModal
          isOpen={isConfirmModalOpen}
          onClose={() => {
            setIsConfirmModalOpen(false);
            setSelectedVolunteer(null);
          }}
          onConfirm={handleToggleActive}
          volunteerName={`${selectedVolunteer.firstName} ${selectedVolunteer.lastName}`}
          action={selectedVolunteer.active ? 'deactivate' : 'activate'}
        />
      )}
    </Box>
  );
};

export default VolunteerManagement;
