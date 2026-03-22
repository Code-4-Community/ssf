import React, { useState, useEffect } from 'react';
import {
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Funnel,
  Search,
} from 'lucide-react';
import {
  Box,
  Button,
  Table,
  Heading,
  Pagination,
  IconButton,
  Checkbox,
  VStack,
  ButtonGroup,
  Input,
} from '@chakra-ui/react';
import { PantryStats, TotalStats } from 'types/types';
import ApiClient from '@api/apiClient';
import { FloatingAlert } from '@components/floatingAlert';
import { useAlert } from '../hooks/alert';

const AdminDonationStats: React.FC = () => {
  const [pantryStats, setPantryStats] = useState<PantryStats[]>([]);
  const [totalStats, setTotalStats] = useState<TotalStats | null>(null);
  const [pantryNameOptions, setPantryNameOptions] = useState<string[]>([]);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [selectedPantries, setSelectedPantries] = useState<string[]>([]);
  const [selectedYears, setSelectedYears] = useState<number[]>([]);
  const [searchPantry, setSearchPantry] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isYearFilterOpen, setIsYearFilterOpen] = useState(false);

  const [alertState, setAlertMessage] = useAlert();

  useEffect(() => {
    Promise.all([
      ApiClient.getApprovedPantryNames(),
      ApiClient.getAvailableYears(),
    ])
      .then(([names, years]) => {
        setPantryNameOptions(names);
        setAvailableYears(years);
        setSelectedYears(years);
      })
      .catch(() => setAlertMessage('Error fetching pantry data'));
  }, [setAlertMessage]);

  useEffect(() => {
    const allSelected =
      selectedYears.length === 0 ||
      selectedYears.length === availableYears.length;
    ApiClient.getTotalStats(allSelected ? undefined : selectedYears)
      .then(setTotalStats)
      .catch(() => setAlertMessage('Error fetching total stats'));
  }, [selectedYears, availableYears, setAlertMessage]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const allSelected =
          selectedYears.length === 0 ||
          selectedYears.length === availableYears.length;
        const stats = await ApiClient.getPantryStats({
          pantryNames: selectedPantries.length ? selectedPantries : undefined,
          years: allSelected ? undefined : selectedYears,
          page: currentPage,
        });
        setPantryStats(stats);
      } catch {
        setAlertMessage('Error fetching pantry stats');
      }
    };
    fetchStats();
  }, [
    selectedPantries,
    selectedYears,
    availableYears,
    currentPage,
    setAlertMessage,
  ]);

  const handleFilterChange = (name: string, checked: boolean) => {
    setCurrentPage(1);
    if (checked) {
      setSelectedPantries([...selectedPantries, name]);
    } else {
      setSelectedPantries(selectedPantries.filter((n) => n !== name));
    }
  };

  const handleYearFilterChange = (year: number, checked: boolean) => {
    setCurrentPage(1);
    if (checked) {
      setSelectedYears([...selectedYears, year]);
    } else {
      setSelectedYears(selectedYears.filter((y) => y !== year));
    }
  };

  const allYearsSelected =
    availableYears.length > 0 && selectedYears.length === availableYears.length;
  const yearButtonLabel =
    allYearsSelected || selectedYears.length === 0
      ? 'All Available Years'
      : [...selectedYears].sort((a, b) => a - b).join(', ');

  const itemsPerPage = 10;
  const totalCount =
    selectedPantries.length > 0
      ? selectedPantries.length
      : pantryNameOptions.length;
  const totalPages = Math.ceil(totalCount / itemsPerPage);

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
        Donation Statistics
      </Heading>
      {alertState && (
        <FloatingAlert
          key={alertState.id}
          message={alertState.message}
          status="error"
          timeout={6000}
        />
      )}
      <Box display="flex" gap={2} mb={6} fontFamily="'Inter', sans-serif">
        <Box position="relative" color="neutral.800">
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
                    color="#B8B8B8"
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
                <VStack
                  align="stretch"
                  fontSize="12px"
                  fontFamily="Inter"
                  color="neutral.800"
                  fontWeight="500"
                  gap={2}
                >
                  {pantryNameOptions
                    .filter((name) =>
                      name.toLowerCase().includes(searchPantry.toLowerCase()),
                    )
                    .map((name) => (
                      <Checkbox.Root
                        key={name}
                        checked={selectedPantries.includes(name)}
                        onCheckedChange={(e: { checked: boolean }) =>
                          handleFilterChange(name, !!e.checked)
                        }
                        size="md"
                      >
                        <Checkbox.HiddenInput />
                        <Checkbox.Control borderRadius="sm" />
                        <Checkbox.Label>{name}</Checkbox.Label>
                      </Checkbox.Root>
                    ))}
                </VStack>
              </Box>
            </>
          )}
        </Box>
        <Box position="relative">
          <Button
            onClick={() => setIsYearFilterOpen(!isYearFilterOpen)}
            variant="outline"
            color="neutral.800"
            border="1px solid"
            borderColor="neutral.200"
            size="sm"
            p={3}
            fontFamily="ibm"
            fontWeight="semibold"
            maxW="220px"
          >
            <Box
              as="span"
              overflow="hidden"
              textOverflow="ellipsis"
              whiteSpace="nowrap"
            >
              {yearButtonLabel}
            </Box>
            <ChevronDown size={14} />
          </Button>

          {isYearFilterOpen && (
            <>
              <Box
                position="fixed"
                top={0}
                left={0}
                right={0}
                bottom={0}
                onClick={() => setIsYearFilterOpen(false)}
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
                <VStack
                  align="stretch"
                  fontSize="12px"
                  fontFamily="Inter"
                  color="neutral.800"
                  fontWeight="500"
                  gap={2}
                >
                  <Checkbox.Root
                    checked={allYearsSelected}
                    onCheckedChange={(e: { checked: boolean }) => {
                      setCurrentPage(1);
                      setSelectedYears(e.checked ? [...availableYears] : []);
                    }}
                    size="md"
                  >
                    <Checkbox.HiddenInput />
                    <Checkbox.Control borderRadius="sm" />
                    <Checkbox.Label>All Available Years</Checkbox.Label>
                  </Checkbox.Root>
                  {[...availableYears]
                    .sort((a, b) => a - b)
                    .map((year) => (
                      <Checkbox.Root
                        key={year}
                        checked={selectedYears.includes(year)}
                        onCheckedChange={(e: { checked: boolean }) =>
                          handleYearFilterChange(year, !!e.checked)
                        }
                        size="md"
                      >
                        <Checkbox.HiddenInput />
                        <Checkbox.Control borderRadius="sm" />
                        <Checkbox.Label>{year}</Checkbox.Label>
                      </Checkbox.Root>
                    ))}
                </VStack>
              </Box>
            </>
          )}
        </Box>
      </Box>
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader
              {...tableHeaderStyles}
              borderRight="1px solid"
              borderRightColor="neutral.100"
              width="25%"
            >
              Pantry
            </Table.ColumnHeader>
            <Table.ColumnHeader
              {...tableHeaderStyles}
              borderRight="1px solid"
              borderRightColor="neutral.100"
              width="10%"
            >
              Total Items
            </Table.ColumnHeader>
            <Table.ColumnHeader
              {...tableHeaderStyles}
              borderRight="1px solid"
              borderRightColor="neutral.100"
              width="10%"
            >
              Total Weight (oz)
            </Table.ColumnHeader>
            <Table.ColumnHeader
              {...tableHeaderStyles}
              borderRight="1px solid"
              borderRightColor="neutral.100"
              width="10%"
            >
              Total Weight (lbs)
            </Table.ColumnHeader>
            <Table.ColumnHeader
              {...tableHeaderStyles}
              borderRight="1px solid"
              borderRightColor="neutral.100"
              width="15%"
            >
              Value of Donated Food
            </Table.ColumnHeader>
            <Table.ColumnHeader
              {...tableHeaderStyles}
              borderRight="1px solid"
              borderRightColor="neutral.100"
              width="15%"
            >
              Shipping Cost/Tax
            </Table.ColumnHeader>
            <Table.ColumnHeader {...tableHeaderStyles} width="10%">
              Total Value
            </Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {totalStats && (
            <Table.Row fontWeight="semibold">
              <Table.Cell
                textStyle="p2"
                borderRight="1px solid"
                borderRightColor="neutral.100"
                py={0}
              >
                All Pantries
              </Table.Cell>
              <Table.Cell
                textStyle="p2"
                borderRight="1px solid"
                borderRightColor="neutral.100"
                bg="yellow.100"
              >
                {totalStats.totalItems}
              </Table.Cell>
              <Table.Cell
                textStyle="p2"
                borderRight="1px solid"
                borderRightColor="neutral.100"
                bg="yellow.100"
              >
                {totalStats.totalOz}
              </Table.Cell>
              <Table.Cell
                textStyle="p2"
                borderRight="1px solid"
                borderRightColor="neutral.100"
                bg="yellow.100"
              >
                {totalStats.totalLbs}
              </Table.Cell>
              <Table.Cell
                textStyle="p2"
                borderRight="1px solid"
                borderRightColor="neutral.100"
                bg="yellow.100"
              >
                ${totalStats.totalDonatedFoodValue.toFixed(2)}
              </Table.Cell>
              <Table.Cell
                textStyle="p2"
                borderRight="1px solid"
                borderRightColor="neutral.100"
                bg="yellow.100"
              >
                ${totalStats.totalShippingCost.toFixed(2)}
              </Table.Cell>
              <Table.Cell textStyle="p2" bg="yellow.100">
                ${totalStats.totalValue.toFixed(2)}
              </Table.Cell>
            </Table.Row>
          )}
          {pantryStats.map((stat) => (
            <Table.Row key={stat.pantryId} _hover={{ bg: 'gray.50' }}>
              <Table.Cell
                textStyle="p2"
                borderRight="1px solid"
                borderRightColor="neutral.100"
                py={0}
              >
                {stat.pantryName}
              </Table.Cell>
              <Table.Cell
                textStyle="p2"
                borderRight="1px solid"
                borderRightColor="neutral.100"
              >
                {stat.totalItems}
              </Table.Cell>
              <Table.Cell
                textStyle="p2"
                borderRight="1px solid"
                borderRightColor="neutral.100"
              >
                {stat.totalOz}
              </Table.Cell>
              <Table.Cell
                textStyle="p2"
                borderRight="1px solid"
                borderRightColor="neutral.100"
              >
                {stat.totalLbs}
              </Table.Cell>
              <Table.Cell
                textStyle="p2"
                borderRight="1px solid"
                borderRightColor="neutral.100"
              >
                ${stat.totalDonatedFoodValue.toFixed(2)}
              </Table.Cell>
              <Table.Cell
                textStyle="p2"
                borderRight="1px solid"
                borderRightColor="neutral.100"
              >
                ${stat.totalShippingCost.toFixed(2)}
              </Table.Cell>
              <Table.Cell textStyle="p2">
                ${stat.totalValue.toFixed(2)}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>

      {totalPages > 1 && (
        <Pagination.Root
          count={totalCount}
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
  );
};

export default AdminDonationStats;
