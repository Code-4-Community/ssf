import { useEffect, useState } from 'react';
import {
  Table,
  Text,
  Flex,
  Input,
  VStack,
  Box,
  Pagination,
  ButtonGroup,
  IconButton,
  Link,
  Button,
  Checkbox,
  Badge,
} from '@chakra-ui/react';
import { ChevronRight, ChevronLeft, Funnel, Search } from 'lucide-react';
import { ApprovedPantryResponse } from '../types/types';
import ApiClient from '@api/apiClient';
import { FloatingAlert } from '@components/floatingAlert';
import { useAlert } from '../hooks/alert';
import { getInitials, USER_ICON_COLORS } from '@utils/utils';
import { RefrigeratedDonation } from '../types/pantryEnums';
import AssignVolunteersModal from '@components/forms/assignVolunteersModal';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ROUTES } from '../routes';

const AdminPantryManagement: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pantries, setPantries] = useState<ApprovedPantryResponse[]>([]);

  // The pantry searched in the filter
  const [searchPantry, setSearchPantry] = useState('');

  // The pantries selected in the filter
  const [selectedPantries, setSelectedPantries] = useState<string[]>([]);

  const [alertState, setAlertMessage] = useAlert();
  const [isAlertSuccess, setIsAlertSuccess] = useState<boolean>(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [
    selectedPantryToAssignVolunteers,
    setSelectedPantryToAssignVolunteers,
  ] = useState<ApprovedPantryResponse | null>(null);

  const pageSize = 10;

  const fetchPantries = async () => {
    try {
      const allApprovedPantries = await ApiClient.getApprovedPantries();
      setPantries(allApprovedPantries);
    } catch {
      setIsAlertSuccess(false);
      setAlertMessage('Error fetching pantries');
    }
  };

  useEffect(() => {
    fetchPantries();
  }, [setAlertMessage]);

  // Pre-fill pantry filter from url param and then clear the param.
  useEffect(() => {
    const volunteerIdFromUrl = searchParams.get('volunteerId');
    if (!volunteerIdFromUrl) return;

    let cancelled = false;
    (async () => {
      try {
        const assignedPantries = await ApiClient.getVolunteerPantries(
          Number(volunteerIdFromUrl),
        );
        if (cancelled) return;
        setSelectedPantries(assignedPantries.map((p) => p.pantryName));
        if (assignedPantries.length === 0) {
          setIsAlertSuccess(false);
          setAlertMessage('This volunteer has no assigned pantries.');
        }
      } catch {
        if (cancelled) return;
        setIsAlertSuccess(false);
        setAlertMessage('Error fetching volunteer pantries');
      } finally {
        if (!cancelled) {
          navigate(ROUTES.PANTRY_MANAGEMENT, { replace: true });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [searchParams, navigate, setAlertMessage]);

  const handleAssignVolunteersSuccess = () => {
    setIsAlertSuccess(true);
    setAlertMessage('Successfully assigned volunteers');
    fetchPantries();
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedPantries]);

  const pantryOptions = [...new Set(pantries.map((p) => p.pantryName))].sort(
    (a, b) => a.localeCompare(b),
  );

  const handleFilterChange = (pantry: string, checked: boolean) => {
    if (checked) {
      setSelectedPantries([...selectedPantries, pantry]);
    } else {
      setSelectedPantries(selectedPantries.filter((p) => p !== pantry));
    }
  };

  const filteredPantries = pantries.filter((p) => {
    const matchesFilter =
      selectedPantries.length === 0 || selectedPantries.includes(p.pantryName);
    return matchesFilter;
  });

  const paginatedPantries = filteredPantries.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const textHeaderStyles = {
    color: 'neutral.800',
    textStyle: 'p2',
    fontWeight: '600',
    fontFamily: 'inter',
  };

  return (
    <Box flexDirection="column" p={12}>
      <Text textStyle="h1" color="gray.light">
        Pantry Management
      </Text>
      {alertState && (
        <FloatingAlert
          key={alertState.id}
          message={alertState.message}
          status={isAlertSuccess ? 'info' : 'error'}
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
          <Flex
            justify="space-between"
            align="center"
            w="100%"
            position="relative"
          >
            <Button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              variant="outline"
              color="neutral.800"
              border="1px solid"
              borderColor="neutral.200"
              size="sm"
              p={3}
              fontFamily="ibm"
              fontWeight="semibold"
            >
              <Funnel />
              Filter
            </Button>
            {isFilterOpen && (
              <>
                <Box
                  position="fixed"
                  top={0}
                  left={0}
                  right={0}
                  bottom={0}
                  onClick={() => setIsFilterOpen(false)}
                  zIndex={10}
                />
                <Box
                  position="absolute"
                  top="100%"
                  left={0}
                  mt={2}
                  bg="white"
                  border="1px solid"
                  borderColor="gray.200"
                  borderRadius="md"
                  boxShadow="lg"
                  p={4}
                  minW="275px"
                  maxH="200px"
                  overflowY="auto"
                  zIndex={20}
                >
                  <Box position="relative" mb={1} pl={0} ml={-2} mt={-2}>
                    <Search
                      size={18}
                      color="var(--chakra-colors-neutral-300)"
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: 8,
                        transform: 'translateY(-50%)',
                      }}
                    />
                    <Input
                      placeholder="Search"
                      color={searchPantry ? 'neutral.800' : 'neutral.300'}
                      value={searchPantry}
                      onChange={(e) => setSearchPantry(e.target.value)}
                      fontSize="sm"
                      pl="30px"
                      border="none"
                      bg="transparent"
                      _focus={{
                        boxShadow: 'none',
                        border: 'none',
                        outline: 'none',
                      }}
                    />
                  </Box>
                  <VStack align="stretch" gap={2}>
                    {pantryOptions
                      .filter((pantry) =>
                        pantry
                          .toLowerCase()
                          .includes(searchPantry.toLowerCase()),
                      )
                      .map((pantry) => (
                        <Checkbox.Root
                          key={pantry}
                          checked={selectedPantries.includes(pantry)}
                          onCheckedChange={(e: { checked: boolean }) =>
                            handleFilterChange(pantry, e.checked)
                          }
                          color="gray.dark"
                          size="md"
                        >
                          <Checkbox.HiddenInput />
                          <Checkbox.Control borderRadius="sm" />
                          <Checkbox.Label>{pantry}</Checkbox.Label>
                        </Checkbox.Root>
                      ))}
                  </VStack>
                </Box>
              </>
            )}
          </Flex>
        </VStack>
        <Table.Root variant="line" showColumnBorder>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader {...textHeaderStyles}>
                Pantry
              </Table.ColumnHeader>
              <Table.ColumnHeader {...textHeaderStyles}>
                Assignee
              </Table.ColumnHeader>
              <Table.ColumnHeader {...textHeaderStyles} textAlign="right">
                Refrigerator-Friendly
              </Table.ColumnHeader>
              <Table.ColumnHeader {...textHeaderStyles} textAlign="right">
                Action
              </Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body
            color="neutral.700"
            fontWeight={400}
            textStyle="p2"
            css={{ '& td': { paddingTop: '8px', paddingBottom: '8px' } }}
          >
            {paginatedPantries?.map((pantry) => (
              <Table.Row key={pantry.pantryId}>
                <Table.Cell>
                  <Link
                    textStyle="p2"
                    color="gray.dark"
                    variant="underline"
                    textDecorationColor="gray.dark"
                    onClick={() =>
                      navigate(
                        ROUTES.PANTRY_MANAGEMENT_DETAILS.replace(
                          ':pantryId',
                          pantry.pantryId.toString(),
                        ),
                      )
                    }
                  >
                    {pantry.pantryName}
                  </Link>
                </Table.Cell>
                <Table.Cell
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  onClick={() => setSelectedPantryToAssignVolunteers(pantry)}
                  cursor="pointer"
                  _hover={{ bg: 'gray.50' }}
                >
                  <Box display="flex" alignItems="center" minH="33px">
                    {pantry.volunteers && pantry.volunteers.length > 0 ? (
                      (() => {
                        const volunteers = pantry.volunteers;
                        const maxVisible = 3;

                        const hasOverflow = volunteers.length > maxVisible;
                        const visibleVolunteers = hasOverflow
                          ? volunteers.slice(0, maxVisible - 1)
                          : volunteers;

                        const remainingCount =
                          volunteers.length - (maxVisible - 1);

                        return (
                          <>
                            {visibleVolunteers.map((volunteer, index) => (
                              <Box
                                key={volunteer.userId}
                                borderRadius="full"
                                bg={
                                  USER_ICON_COLORS[
                                    volunteer.userId % USER_ICON_COLORS.length
                                  ]
                                }
                                width="33px"
                                height="33px"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                color="white"
                                fontSize="12px"
                                ml={index === 0 ? 0 : '-4px'}
                                zIndex={index}
                                border="1px solid white"
                              >
                                {getInitials(
                                  volunteer.firstName,
                                  volunteer.lastName,
                                )}
                              </Box>
                            ))}

                            {hasOverflow && (
                              <Box
                                borderRadius="full"
                                bg="neutral.500"
                                width="33px"
                                height="33px"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                color="neutral.50"
                                textStyle="p2"
                                ml="-4px"
                                zIndex={maxVisible}
                                border="1px solid white"
                              >
                                +{remainingCount}
                              </Box>
                            )}
                          </>
                        );
                      })()
                    ) : (
                      <Box color="neutral.600" fontStyle="p2">
                        No Volunteer
                      </Box>
                    )}
                  </Box>
                </Table.Cell>
                <Table.Cell textAlign="right">
                  <Badge
                    py={1}
                    px={2}
                    color="neutral.800"
                    textStyle="p2"
                    fontWeight={500}
                    fontSize="12px"
                    bgColor={
                      pantry.refrigeratedDonation === RefrigeratedDonation.NO
                        ? 'neutral.200'
                        : 'neutral.100'
                    }
                  >
                    {pantry.refrigeratedDonation === RefrigeratedDonation.NO
                      ? 'Not Refrigerator-Friendly'
                      : 'Refrigerator-Friendly'}
                  </Badge>
                </Table.Cell>
                <Table.Cell textAlign="right">
                  <Link
                    color="neutral.700"
                    fontWeight={400}
                    textStyle="p2"
                    variant="underline"
                    textDecorationColor="neutral.700"
                    cursor="pointer"
                    onClick={() =>
                      navigate(
                        `${ROUTES.ADMIN_ORDER_MANAGEMENT}?pantryId=${pantry.pantryId}`,
                      )
                    }
                  >
                    View Orders
                  </Link>
                </Table.Cell>
              </Table.Row>
            ))}
            {selectedPantryToAssignVolunteers && (
              <AssignVolunteersModal
                pantry={selectedPantryToAssignVolunteers}
                onClose={() => setSelectedPantryToAssignVolunteers(null)}
                onSuccess={handleAssignVolunteersSuccess}
                isOpen={true}
              />
            )}
          </Table.Body>
        </Table.Root>
        <Flex justify="center" mt={12}>
          <Pagination.Root
            count={Math.ceil(filteredPantries.length / pageSize)}
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
                    borderColor={{
                      base: 'neutral.100',
                      _selected: 'neutral.600',
                    }}
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
                    Math.ceil(filteredPantries.length / pageSize)
                  }
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.min(
                        prev + 1,
                        Math.ceil(filteredPantries.length / pageSize),
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
    </Box>
  );
};

export default AdminPantryManagement;
