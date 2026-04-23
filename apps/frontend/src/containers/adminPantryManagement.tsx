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
import { getInitials } from '@utils/utils';
import { RefrigeratedDonation } from '../types/pantryEnums';

const AdminPantryManagement: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pantries, setPantries] = useState<ApprovedPantryResponse[]>([]);
  const [searchPantry, setSearchPantry] = useState('');

  const [selectedPantries, setSelectedPantries] = useState<string[]>([]);

  const [alertState, setAlertMessage] = useAlert();
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const pageSize = 8;

  const USER_ICON_COLORS = ['#F89E19', '#CC3538', '#2795A5', '#2B4E60'];

  useEffect(() => {
    const fetchPantries = async () => {
      try {
        const allApprovedPantries = await ApiClient.getApprovedPantries();
        setPantries(allApprovedPantries);
      } catch {
        setAlertMessage('Error fetching pantries');
      }
    };

    fetchPantries();
  }, [setAlertMessage]);

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

  return (
    <Box flexDirection="column" p={12}>
      <Text textStyle="h1" color="#515151">
        Pantry Management
      </Text>
      {alertState && (
        <FloatingAlert
          key={alertState.id}
          message={alertState.message}
          status={submitSuccess ? 'info' : 'error'}
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
              color="neutral.600"
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
                  maxH="150px"
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
                          color="black"
                          size="sm"
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
              <Table.ColumnHeader
                color="neutral.800"
                textStyle="p2"
                fontWeight={600}
              >
                Pantry
              </Table.ColumnHeader>
              <Table.ColumnHeader
                color="neutral.800"
                textStyle="p2"
                fontWeight={600}
              >
                Assignee
              </Table.ColumnHeader>
              <Table.ColumnHeader
                color="neutral.800"
                textStyle="p2"
                fontWeight={600}
                textAlign="right"
              >
                Refridgerator-Friendly
              </Table.ColumnHeader>
              <Table.ColumnHeader
                color="neutral.800"
                textStyle="p2"
                fontWeight={600}
                textAlign="right"
              >
                Action
              </Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body color="neutral.700" fontWeight={400} textStyle="p2">
            {paginatedPantries?.map((pantry) => (
              <Table.Row key={pantry.pantryId}>
                <Table.Cell>
                  <Link
                    textStyle="p2"
                    color="black"
                    variant="underline"
                    textDecorationColor="neutral.700"
                  >
                    {pantry.pantryName}
                  </Link>
                </Table.Cell>
                <Table.Cell
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
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
                                ml={index === 0 ? 0 : '-10px'}
                                zIndex={index}
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
                                ml="-10px"
                                zIndex={maxVisible}
                              >
                                +{remainingCount}
                              </Box>
                            )}
                          </>
                        );
                      })()
                    ) : (
                      <Box color="neutral.600" fontStyle="p2">
                        No volunteer
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
                    fontWeight={400}
                    fontSize="12px"
                    bgColor={
                      pantry.refrigeratedDonation === RefrigeratedDonation.YES
                        ? 'neutral.100'
                        : 'neutral.200'
                    }
                  >
                    {pantry.refrigeratedDonation === RefrigeratedDonation.YES
                      ? 'Refridgerator-Friendly'
                      : 'Not Refridgerator-Friendly'}
                  </Badge>
                </Table.Cell>
                <Table.Cell textAlign="right">
                  <Link
                    color="neutral.700"
                    fontWeight={400}
                    textStyle="p2"
                    variant="underline"
                    textDecorationColor="neutral.700"
                    // TODO href or some functionality to view orders
                  >
                    View Orders
                  </Link>
                </Table.Cell>
              </Table.Row>
            ))}
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
                    currentPage === Math.ceil(pantries.length / pageSize)
                  }
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.min(prev + 1, Math.ceil(pantries.length / pageSize)),
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
