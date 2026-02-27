import React, { useEffect, useState } from 'react';
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
import { Pantry } from 'types/types';
import {
  ArrowDownUp,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  Funnel,
} from 'lucide-react';

const ApprovePantries: React.FC = () => {
  const [pantries, setPantries] = useState<Pantry[]>([]);
  const [sortAsc, setSortAsc] = useState(true);
  const [selectedPantries, setSelectedPantries] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const fetchPantries = async () => {
    try {
      const data = await ApiClient.getAllPendingPantries();
      setPantries(data);
    } catch (error) {
      alert('Error fetching unapproved pantries: ' + error);
    }
  };

  useEffect(() => {
    fetchPantries();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedPantries]);

  const pantryOptions = [
    ...new Set(
      pantries
        .map((p) => p.pantryName)
        .filter((name): name is string => !!name),
    ),
  ].sort((a, b) => a.localeCompare(b));

  const handleFilterChange = (pantry: string, checked: boolean) => {
    if (checked) {
      setSelectedPantries([...selectedPantries, pantry]);
    } else {
      setSelectedPantries(selectedPantries.filter((p) => p !== pantry));
    }
  };

  const filteredPantries = pantries
    .filter((p) => {
      const matchesFilter =
        selectedPantries.length === 0 ||
        selectedPantries.includes(p.pantryName);
      return matchesFilter;
    })
    .sort((a, b) =>
      sortAsc
        ? new Date(a.dateApplied).getTime() - new Date(b.dateApplied).getTime()
        : new Date(b.dateApplied).getTime() - new Date(a.dateApplied).getTime(),
    );

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredPantries.length / itemsPerPage);
  const paginatedPantries = filteredPantries.slice(
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

  return (
    <Box p={12}>
      <Heading textStyle="h1" color="gray.600" mb={6}>
        Application Review
      </Heading>
      {filteredPantries.length === 0 ? (
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
                      {pantryOptions.map((pantry) => (
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
                  Pantry
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
              {paginatedPantries.map((pantry, index) => (
                <Table.Row
                  key={`${pantry.pantryId}-${index}`}
                  _hover={{ bg: 'gray.50' }}
                >
                  <Table.Cell
                    textStyle="p2"
                    borderRight="1px solid"
                    borderRightColor="neutral.100"
                    py={0}
                  >
                    {pantry.pantryId}
                  </Table.Cell>
                  <Table.Cell
                    textStyle="p2"
                    borderRight="1px solid"
                    borderRightColor="neutral.100"
                  >
                    {pantry.pantryName}
                  </Table.Cell>
                  <Table.Cell
                    textStyle="p2"
                    borderRight="1px solid"
                    borderRightColor="neutral.100"
                  >
                    {new Date(pantry.dateApplied).toLocaleDateString('en-US', {
                      month: '2-digit',
                      day: '2-digit',
                      year: 'numeric',
                    })}
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
                      href={`/application-details/${pantry.pantryId}`}
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
              count={filteredPantries.length}
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

export default ApprovePantries;
