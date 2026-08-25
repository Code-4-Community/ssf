import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Funnel, Search } from 'lucide-react';
import {
  Box,
  Button,
  Table,
  Heading,
  Checkbox,
  VStack,
  Input,
} from '@chakra-ui/react';
import { AlertStatus, PantryStats, TotalStats } from '../types/types';
import ApiClient from '@api/apiClient';
import { FloatingAlert } from '@components/floatingAlert';
import { useAlert } from '../hooks/alert';
import { PaginationControl } from '@components/pagination';

const AdminDonationStats: React.FC = () => {
  // Individual and combined pantry stats to be displayed
  const [pantryStats, setPantryStats] = useState<PantryStats[]>([]);
  const [totalStats, setTotalStats] = useState<TotalStats>();
  // Names and years of all approved pantries, used for filters
  const [pantryNameOptions, setPantryNameOptions] = useState<string[]>([]);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  // Filtering state management
  const [selectedPantries, setSelectedPantries] = useState<string[]>([]);
  const [selectedYears, setSelectedYears] = useState<number[]>([]);
  const [searchPantry, setSearchPantry] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isYearFilterOpen, setIsYearFilterOpen] = useState(false);

  const [alertState, setAlertMessage] = useAlert();

  const totalStatsRequestIdRef = useRef(0);
  const pantryStatsRequestIdRef = useRef(0);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const names = await ApiClient.getApprovedPantryNames();
        setPantryNameOptions(names);
      } catch {
        setAlertMessage('Error fetching pantry names', AlertStatus.ERROR);
      }

      try {
        const years = await ApiClient.getPantryOrderYears();
        setAvailableYears(years);
      } catch {
        setAlertMessage('Error fetching available years', AlertStatus.ERROR);
      }
    };
    fetchInitialData();
  }, [setAlertMessage]);

  useEffect(() => {
    const requestId = ++totalStatsRequestIdRef.current;
    const fetchTotalStats = async () => {
      try {
        const stats = await ApiClient.getTotalStats(
          selectedYears.length ? selectedYears : undefined,
        );
        if (requestId === totalStatsRequestIdRef.current) {
          setTotalStats(stats);
        }
      } catch {
        if (requestId === totalStatsRequestIdRef.current) {
          setAlertMessage('Error fetching total stats', AlertStatus.ERROR);
        }
      }
    };
    fetchTotalStats();
  }, [setAlertMessage, selectedYears]);

  useEffect(() => {
    const requestId = ++pantryStatsRequestIdRef.current;
    const fetchStats = async () => {
      try {
        const stats = await ApiClient.getPantryStats({
          pantryNames: selectedPantries.length ? selectedPantries : undefined,
          years: selectedYears.length ? selectedYears : undefined,
          page: currentPage,
        });
        if (requestId === pantryStatsRequestIdRef.current) {
          setPantryStats(stats);
        }
      } catch {
        if (requestId === pantryStatsRequestIdRef.current) {
          setAlertMessage('Error fetching pantry stats', AlertStatus.ERROR);
        }
      }
    };
    fetchStats();
  }, [setAlertMessage, selectedPantries, selectedYears, currentPage]);

  const handlePantryNameFilterChange = (name: string, checked: boolean) => {
    // For simplicity, reset the page
    setCurrentPage(1);
    if (checked) {
      setSelectedPantries([...selectedPantries, name]);
    } else {
      setSelectedPantries(selectedPantries.filter((n) => n !== name));
    }
  };

  const handleYearFilterChange = (year: number, checked: boolean) => {
    // For simplicity, reset the page
    setCurrentPage(1);
    if (checked) {
      setSelectedYears([...selectedYears, year]);
    } else {
      setSelectedYears(selectedYears.filter((y) => y !== year));
    }
  };

  const yearButtonLabel =
    selectedYears.length === 0
      ? 'Year'
      : [...selectedYears].sort((a, b) => a - b).join(', ');

  const itemsPerPage = 10;
  const pantryList =
    selectedPantries.length > 0 ? selectedPantries : pantryNameOptions;
  const totalCount = pantryList.length;

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
          status={alertState.status}
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
                          handlePantryNameFilterChange(name, !!e.checked)
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
                  {[...availableYears].map((year) => (
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
              width="20%"
            >
              Pantry
            </Table.ColumnHeader>
            <Table.ColumnHeader
              {...tableHeaderStyles}
              borderRight="1px solid"
              borderRightColor="neutral.100"
              width="8%"
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
              Fair Market Value of Food Donation
            </Table.ColumnHeader>
            <Table.ColumnHeader
              {...tableHeaderStyles}
              borderRight="1px solid"
              borderRightColor="neutral.100"
              width="13%"
            >
              Shipping/
              <br />
              Delivery Expenses
            </Table.ColumnHeader>
            <Table.ColumnHeader
              {...tableHeaderStyles}
              borderRight="1px solid"
              borderRightColor="neutral.100"
              width="13%"
            >
              Shipping Paid by SSF
            </Table.ColumnHeader>
            <Table.ColumnHeader
              {...tableHeaderStyles}
              borderRight="1px solid"
              borderRightColor="neutral.100"
              width="8%"
            >
              Total Value
            </Table.ColumnHeader>
            <Table.ColumnHeader
              {...tableHeaderStyles}
              borderRight="1px solid"
              borderRightColor="neutral.100"
              width="10%"
            >
              % Food Rescue
            </Table.ColumnHeader>
            <Table.ColumnHeader {...tableHeaderStyles} width="10%">
              Lbs Food Rescue
            </Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
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
              {totalStats?.totalItems ?? 0}
            </Table.Cell>
            <Table.Cell
              textStyle="p2"
              borderRight="1px solid"
              borderRightColor="neutral.100"
              bg="yellow.100"
            >
              {(totalStats?.totalOz ?? 0).toFixed(2)}
            </Table.Cell>
            <Table.Cell
              textStyle="p2"
              borderRight="1px solid"
              borderRightColor="neutral.100"
              bg="yellow.100"
            >
              {(totalStats?.totalLbs ?? 0).toFixed(2)}
            </Table.Cell>
            <Table.Cell
              textStyle="p2"
              borderRight="1px solid"
              borderRightColor="neutral.100"
              bg="yellow.100"
            >
              ${(totalStats?.totalDonatedFoodValue ?? 0).toFixed(2)}
            </Table.Cell>
            <Table.Cell
              textStyle="p2"
              borderRight="1px solid"
              borderRightColor="neutral.100"
              bg="yellow.100"
            >
              ${(totalStats?.totalShippingCost ?? 0).toFixed(2)}
            </Table.Cell>
            <Table.Cell
              textStyle="p2"
              borderRight="1px solid"
              borderRightColor="neutral.100"
              bg="yellow.100"
            >
              ${(totalStats?.totalShippingCostPaidBySsf ?? 0).toFixed(2)}
            </Table.Cell>
            <Table.Cell
              textStyle="p2"
              borderRight="1px solid"
              borderRightColor="neutral.100"
              bg="yellow.100"
            >
              ${(totalStats?.totalValue ?? 0).toFixed(2)}
            </Table.Cell>
            <Table.Cell
              textStyle="p2"
              borderRight="1px solid"
              borderRightColor="neutral.100"
              bg="yellow.100"
            >
              {(totalStats?.percentageFoodRescueItems ?? 0).toFixed(2)}%
            </Table.Cell>
            <Table.Cell textStyle="p2" bg="yellow.100">
              {(totalStats?.foodRescueLbs ?? 0).toFixed(2)}
            </Table.Cell>
          </Table.Row>
          {pantryStats.map((stat) => (
            <Table.Row key={stat.pantryId} _hover={{ bg: 'neutral.50' }}>
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
                {stat.totalOz.toFixed(2)}
              </Table.Cell>
              <Table.Cell
                textStyle="p2"
                borderRight="1px solid"
                borderRightColor="neutral.100"
              >
                {stat.totalLbs.toFixed(2)}
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
              <Table.Cell
                textStyle="p2"
                borderRight="1px solid"
                borderRightColor="neutral.100"
              >
                ${stat.totalShippingCostPaidBySsf.toFixed(2)}
              </Table.Cell>
              <Table.Cell
                textStyle="p2"
                borderRight="1px solid"
                borderRightColor="neutral.100"
              >
                ${stat.totalValue.toFixed(2)}
              </Table.Cell>
              <Table.Cell
                textStyle="p2"
                borderRight="1px solid"
                borderRightColor="neutral.100"
              >
                {stat.percentageFoodRescueItems.toFixed(2)}%
              </Table.Cell>
              <Table.Cell textStyle="p2">
                {stat.foodRescueLbs.toFixed(2)}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>

      <Box mt={12}>
        <PaginationControl
          count={totalCount}
          pageSize={itemsPerPage}
          page={currentPage}
          onPageChange={setCurrentPage}
        />
      </Box>
    </Box>
  );
};

export default AdminDonationStats;
