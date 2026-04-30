import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ROUTES } from '../routes';
import {
  Table,
  Button,
  Box,
  Heading,
  VStack,
  Checkbox,
  Pagination,
  ButtonGroup,
  IconButton,
  Link,
} from '@chakra-ui/react';
import ApiClient from '@api/apiClient';
import { FoodManufacturer } from 'types/types';
import {
  ArrowDownUp,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  Funnel,
} from 'lucide-react';
import { useAlert } from '../hooks/alert';
import { FloatingAlert } from '@components/floatingAlert';

const ApproveFoodManufacturers: React.FC = () => {
  const [foodManufacturers, setFoodManufacturers] = useState<
    FoodManufacturer[]
  >([]);
  const [sortAsc, setSortAsc] = useState(false);
  const [selectedFoodManufacturers, setSelectedFoodManufacturers] = useState<
    string[]
  >([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [alertState, setAlertMessage] = useAlert();

  useEffect(() => {
    const fetchFoodManufacturers = async () => {
      try {
        const data = await ApiClient.getAllPendingFoodManufacturers();
        setFoodManufacturers(data);
      } catch {
        setAlertMessage('Error fetching food manufacturers');
      }
    };

    fetchFoodManufacturers();
  }, [setAlertMessage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedFoodManufacturers]);

  const foodManufacturerOptions = [
    ...new Set(
      foodManufacturers
        .map((fm) => fm.foodManufacturerName)
        .filter((name): name is string => !!name),
    ),
  ].sort((a, b) => a.localeCompare(b));

  const handleFilterChange = (foodManufacturer: string, checked: boolean) => {
    if (checked) {
      setSelectedFoodManufacturers([
        ...selectedFoodManufacturers,
        foodManufacturer,
      ]);
    } else {
      setSelectedFoodManufacturers(
        selectedFoodManufacturers.filter((fm) => fm !== foodManufacturer),
      );
    }
  };

  const filteredFoodManufacturers = foodManufacturers
    .filter((fm) => {
      const matchesFilter =
        selectedFoodManufacturers.length === 0 ||
        selectedFoodManufacturers.includes(fm.foodManufacturerName);
      return matchesFilter;
    })
    .sort((a, b) =>
      sortAsc
        ? new Date(a.dateApplied).getTime() - new Date(b.dateApplied).getTime()
        : new Date(b.dateApplied).getTime() - new Date(a.dateApplied).getTime(),
    );

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredFoodManufacturers.length / itemsPerPage);
  const paginatedFoodManufacturers = filteredFoodManufacturers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const tableHeaderStyles = {
    borderBottom: '1px solid',
    borderColor: 'neutral.100',
    color: 'neutral.800',
    fontFamily: 'inter',
    fontWeight: '600',
    fontSize: 'sm',
  };

  useEffect(() => {
    const action = searchParams.get('action');
    const name = searchParams.get('name');

    if (action && name) {
      const message =
        action === 'approved'
          ? `${name} - Application Accepted`
          : `${name} - Application Rejected`;

      setAlertMessage(message);
      setSearchParams({});
    }
  }, [searchParams, setSearchParams, setAlertMessage]);

  return (
    <Box p={12}>
      <Heading textStyle="h1" color="gray.600" mb={6}>
        Application Review
      </Heading>
      {alertState && (
        <FloatingAlert
          key={alertState.id}
          message={alertState.message}
          status="info"
          timeout={6000}
        />
      )}
      {filteredFoodManufacturers.length === 0 ? (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
          fontFamily="'Inter', sans-serif"
          fontSize="sm"
          color="neutral.600"
          py={10}
          gap={2}
          minH="40vh"
        >
          <Box mb={2}>
            <CircleCheck size={24} color="#262626" />
          </Box>
          <Box fontWeight="600" fontSize="lg" color="neutral.800">
            No Applications
          </Box>
          <Box color="neutral.700" fontWeight="400">
            There are no applications to review at this time
          </Box>
        </Box>
      ) : (
        <Box>
          <Box display="flex" gap={2} mb={6} fontFamily="'Inter', sans-serif">
            <Box position="relative">
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
                    <VStack align="stretch" gap={2}>
                      {foodManufacturerOptions.map((foodManufacturer) => (
                        <Checkbox.Root
                          key={foodManufacturer}
                          checked={selectedFoodManufacturers.includes(
                            foodManufacturer,
                          )}
                          onCheckedChange={(e: { checked: boolean }) =>
                            handleFilterChange(foodManufacturer, e.checked)
                          }
                          color="black"
                          size="sm"
                        >
                          <Checkbox.HiddenInput />
                          <Checkbox.Control borderRadius="sm" />
                          <Checkbox.Label>{foodManufacturer}</Checkbox.Label>
                        </Checkbox.Root>
                      ))}
                    </VStack>
                  </Box>
                </>
              )}
            </Box>
            <Button
              onClick={() => setSortAsc((s) => !s)}
              variant="outline"
              color="neutral.600"
              border="1px solid"
              borderColor="neutral.200"
              p={3}
              size="sm"
              fontFamily="ibm"
              fontWeight="semibold"
            >
              <ArrowDownUp />
              Sort
            </Button>
          </Box>
          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader
                  {...tableHeaderStyles}
                  borderRight="1px solid"
                  borderRightColor="neutral.100"
                  width="10%"
                >
                  Application #
                </Table.ColumnHeader>
                <Table.ColumnHeader
                  {...tableHeaderStyles}
                  borderRight="1px solid"
                  borderRightColor="neutral.100"
                  width="45%"
                >
                  Food Manufacturer
                </Table.ColumnHeader>
                <Table.ColumnHeader
                  {...tableHeaderStyles}
                  borderRight="1px solid"
                  borderRightColor="neutral.100"
                  width="15%"
                >
                  Date Applied
                </Table.ColumnHeader>
                <Table.ColumnHeader
                  {...tableHeaderStyles}
                  textAlign="right"
                  width="25%"
                >
                  Actions
                </Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {paginatedFoodManufacturers.map((foodManufacturer, index) => (
                <Table.Row
                  key={`${foodManufacturer.foodManufacturerId}-${index}`}
                  _hover={{ bg: 'gray.50' }}
                >
                  <Table.Cell
                    textStyle="p2"
                    borderRight="1px solid"
                    borderRightColor="neutral.100"
                    py={0}
                  >
                    {foodManufacturer.foodManufacturerId}
                  </Table.Cell>
                  <Table.Cell
                    textStyle="p2"
                    borderRight="1px solid"
                    borderRightColor="neutral.100"
                  >
                    {foodManufacturer.foodManufacturerName}
                  </Table.Cell>
                  <Table.Cell
                    textStyle="p2"
                    borderRight="1px solid"
                    borderRightColor="neutral.100"
                  >
                    {new Date(foodManufacturer.dateApplied).toLocaleDateString(
                      'en-US',
                      {
                        month: '2-digit',
                        day: '2-digit',
                        year: 'numeric',
                      },
                    )}
                  </Table.Cell>
                  <Table.Cell
                    textStyle="p2"
                    textAlign="right"
                    color="neutral.700"
                  >
                    <Link
                      color="neutral.700"
                      fontWeight={400}
                      textStyle="p2"
                      variant="underline"
                      textDecorationColor="neutral.700"
                      href={ROUTES.FOOD_MANUFACTURER_APPLICATION_DETAILS.replace(
                        ':applicationId',
                        String(foodManufacturer.foodManufacturerId),
                      )}
                    >
                      View Details
                    </Link>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>

          {totalPages > 1 && (
            <Pagination.Root
              count={filteredFoodManufacturers.length}
              pageSize={itemsPerPage}
              page={currentPage}
              onPageChange={(e: { page: number }) => setCurrentPage(e.page)}
            >
              <ButtonGroup
                display="flex"
                justifyContent="center"
                alignItems="center"
                mt={12}
                variant="outline"
                size="sm"
                gap={4}
              >
                <Pagination.PrevTrigger
                  color="neutral.800"
                  variant="outline"
                  _hover={{ color: 'black', cursor: 'pointer' }}
                >
                  <ChevronLeft size={16} />
                </Pagination.PrevTrigger>

                <Pagination.Items
                  render={(page) => (
                    <IconButton
                      borderColor={{
                        base: 'neutral.100',
                        _selected: 'neutral.600',
                      }}
                    >
                      {page.value}
                    </IconButton>
                  )}
                />

                <Pagination.NextTrigger
                  color="neutral.800"
                  variant="ghost"
                  _hover={{ color: 'black', cursor: 'pointer' }}
                >
                  <ChevronRight size={16} />
                </Pagination.NextTrigger>
              </ButtonGroup>
            </Pagination.Root>
          )}
        </Box>
      )}
    </Box>
  );
};

export default ApproveFoodManufacturers;
