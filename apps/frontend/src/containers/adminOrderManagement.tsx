import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Table,
  Heading,
  Pagination,
  IconButton,
  VStack,
  ButtonGroup,
  Checkbox,
  Input,
} from '@chakra-ui/react';
import {
  ArrowDownUp,
  ChevronRight,
  ChevronLeft,
  Funnel,
  Mail,
  CircleCheck,
  Search,
} from 'lucide-react';
import { capitalize, formatDate } from '@utils/utils';
import ApiClient from '@api/apiClient';
import { OrderStatus, OrderSummary } from '../types/types';
import OrderDetailsModal from '@components/forms/orderDetailsModal';

// Extending the OrderSummary type to include assignee color for display
type OrderWithColor = OrderSummary & { assigneeColor?: string };

const AdminOrderManagement: React.FC = () => {
  // State to hold orders grouped by status
  const [statusOrders, setStatusOrders] = useState<
    Record<OrderStatus, OrderWithColor[]>
  >({
    [OrderStatus.PENDING]: [],
    [OrderStatus.SHIPPED]: [],
    [OrderStatus.DELIVERED]: [],
  });

  // State to hold selected order for details modal
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  // State to hold current page per status
  const [currentPages, setCurrentPages] = useState<Record<OrderStatus, number>>(
    {
      [OrderStatus.PENDING]: 1,
      [OrderStatus.SHIPPED]: 1,
      [OrderStatus.DELIVERED]: 1,
    },
  );

  // State to hold filter state per status
  type FilterState = {
    selectedPantries: string[];
    searchPantry: string;
    sortAsc: boolean;
  };

  // Record to store the filter state for each status
  // selectedPantries represents the pantries selected in the filter
  // searchPantry is the current search input for pantry filtering
  // sortAsc indicates whether the sorting is ascending (oldest first) or descending (newest first)
  // We store all these here to determine what orders to display for each status
  const [filterStates, setFilterStates] = useState<
    Record<OrderStatus, FilterState>
  >({
    [OrderStatus.PENDING]: {
      selectedPantries: [],
      searchPantry: '',
      sortAsc: true,
    },
    [OrderStatus.SHIPPED]: {
      selectedPantries: [],
      searchPantry: '',
      sortAsc: true,
    },
    [OrderStatus.DELIVERED]: {
      selectedPantries: [],
      searchPantry: '',
      sortAsc: true,
    },
  });

  // Color mapping for statuses
  const STATUS_COLORS = new Map<OrderStatus, [string, string]>([
    [OrderStatus.PENDING, ['yellow.200', 'yellow.hover']],
    [OrderStatus.SHIPPED, ['blue.200', 'blue.core']],
    [OrderStatus.DELIVERED, ['teal.200', 'teal.hover']],
  ]);

  const MAX_PER_STATUS = 5;

  const ASSIGNEE_COLORS = ['yellow.ssf', 'red', 'cyan', 'blue.ssf'];

  useEffect(() => {
    // Fetch all orders on component mount and sorts them into their appropriate status lists
    const fetchOrders = async () => {
      try {
        const data = await ApiClient.getAllOrders();

        const grouped: Record<OrderStatus, OrderWithColor[]> = {
          [OrderStatus.PENDING]: [],
          [OrderStatus.SHIPPED]: [],
          [OrderStatus.DELIVERED]: [],
        };

        // Use a status specific counter for assignee color assignment
        const counters: Record<OrderStatus, number> = {
          [OrderStatus.PENDING]: 0,
          [OrderStatus.SHIPPED]: 0,
          [OrderStatus.DELIVERED]: 0,
        };

        for (const order of data) {
          const status = order.status;

          const orderWithColor: OrderWithColor = { ...order };
          if (
            order.request.pantry.volunteers &&
            order.request.pantry.volunteers.length > 0
          ) {
            orderWithColor.assigneeColor =
              ASSIGNEE_COLORS[counters[status] % ASSIGNEE_COLORS.length];
            counters[status]++;
          }
          grouped[status].push(orderWithColor);
        }

        setStatusOrders(grouped);

        // Initialize current page for each status
        const initialPages: Record<OrderStatus, number> = {
          [OrderStatus.PENDING]: 1,
          [OrderStatus.SHIPPED]: 1,
          [OrderStatus.DELIVERED]: 1,
        };
        setCurrentPages(initialPages);
      } catch (error) {
        alert('Error fetching orders: ' + error);
      }
    };

    fetchOrders();
  }, []);

  // Helper to reset page for a specific status
  const resetPageForStatus = (status: OrderStatus) => {
    setCurrentPages((prev) => ({ ...prev, [status]: 1 }));
  };

  const handlePageChange = (status: OrderStatus, page: number) => {
    setCurrentPages((prev) => ({
      ...prev,
      [status]: page,
    }));
  };

  return (
    <Box p={12}>
      <Heading textStyle="h1" color="gray.600" mb={8}>
        Order Management
      </Heading>

      {Object.values(OrderStatus).map((status) => {
        const allOrders = statusOrders[status] || [];
        const filterState = filterStates[status];

        // Get pantry options through all orders in the status
        const pantryOptions = [
          ...new Set(allOrders.map((o) => o.request.pantry.pantryName)),
        ].sort((a, b) => a.localeCompare(b));

        // Apply filters and sorting to all orders
        const filteredOrders = allOrders
          .filter(
            (o) =>
              filterState.selectedPantries.length === 0 ||
              filterState.selectedPantries.includes(
                o.request.pantry.pantryName,
              ),
          )
          .sort((a, b) =>
            filterState.sortAsc
              ? a.createdAt.localeCompare(b.createdAt)
              : b.createdAt.localeCompare(a.createdAt),
          );

        const totalFiltered = filteredOrders.length;
        const currentPage = currentPages[status] || 1;
        const displayedOrders = filteredOrders.slice(
          (currentPage - 1) * MAX_PER_STATUS,
          currentPage * MAX_PER_STATUS,
        );

        return (
          <Box key={status} mb={12}>
            <OrderStatusSection
              orders={displayedOrders}
              status={status}
              colors={STATUS_COLORS.get(status)!}
              selectedOrderId={selectedOrderId}
              onOrderSelect={setSelectedOrderId}
              totalOrders={totalFiltered}
              currentPage={currentPage}
              onPageChange={(page) => handlePageChange(status, page)}
              pantryOptions={pantryOptions}
              filterState={filterState}
              onFilterChange={(newState: FilterState) =>
                // Update filter state for the specific status
                setFilterStates((prev) => {
                  const prevSelected = prev[status]?.selectedPantries || [];
                  const prevKey = [...prevSelected].sort().join(',');
                  const newKey = [...newState.selectedPantries]
                    .sort()
                    .join(',');
                  // Reset page if selected pantries changed
                  if (prevKey !== newKey) {
                    resetPageForStatus(status);
                  }
                  return { ...prev, [status]: newState };
                })
              }
            />
          </Box>
        );
      })}
    </Box>
  );
};

interface OrderStatusSectionProps {
  orders: OrderWithColor[];
  status: OrderStatus;
  colors: string[];
  onOrderSelect: (orderId: number | null) => void;
  selectedOrderId: number | null;
  totalOrders: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  pantryOptions: string[];
  filterState: {
    selectedPantries: string[];
    searchPantry: string;
    sortAsc: boolean;
  };
  onFilterChange: (newState: {
    selectedPantries: string[];
    searchPantry: string;
    sortAsc: boolean;
  }) => void;
}

const OrderStatusSection: React.FC<OrderStatusSectionProps> = ({
  orders,
  status,
  colors,
  onOrderSelect,
  selectedOrderId,
  totalOrders,
  currentPage,
  onPageChange,
  pantryOptions,
  filterState,
  onFilterChange,
}) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);

  const MAX_PER_STATUS = 5;
  const totalPages = Math.ceil(totalOrders / MAX_PER_STATUS);

  const handleFilterChange = (pantry: string, checked: boolean) => {
    const newSelected = checked
      ? [...filterState.selectedPantries, pantry]
      : filterState.selectedPantries.filter((p) => p !== pantry);
    onFilterChange({ ...filterState, selectedPantries: newSelected });
  };

  const tableHeaderStyles = {
    borderBottom: '1px solid',
    borderColor: 'neutral.100',
    color: 'neutral.800',
    fontFamily: 'ibm',
    fontWeight: '600',
    fontSize: 'sm',
  };

  const tableCellStyles = {
    borderBottom: '1px solid',
    borderColor: 'neutral.100',
    color: 'black',
    fontFamily: "'Inter', sans-serif",
    fontSize: 'sm',
    py: 0,
  };

  return (
    <Box>
      <Box
        display="inline-flex"
        alignItems="center"
        justifyContent="space-between"
        backgroundColor={colors[0]}
        p={3}
        borderRadius="md"
        minW="fit-content"
      >
        <Mail size={18} />
        <Box
          ml={3}
          fontFamily="ibm"
          fontSize="14px"
          fontWeight="semibold"
          color="neutral.700"
        >
          {capitalize(status)}
        </Box>
      </Box>

      {orders.length === 0 ? (
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
        >
          <Box mb={2}>
            <CircleCheck size={24} color="#262626" />
          </Box>
          <Box fontWeight="600" fontSize="lg" color="neutral.800">
            No Orders
          </Box>
          <Box color="neutral.700" fontWeight="400">
            You have no {status.toLowerCase()} orders at this time.
          </Box>
        </Box>
      ) : (
        <>
          <Box
            display="flex"
            justifyContent="flex-end"
            alignItems="center"
            mb={3}
            position="relative"
            fontFamily="'Inter', sans-serif"
            gap={3}
          >
            <Box position="relative">
              <Button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                variant="outline"
                color="neutral.800"
                fontWeight="semibold"
                border="1px solid"
                borderColor="neutral.200"
                size="sm"
                p={3}
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
                    right={0}
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
                        color={
                          filterState.searchPantry
                            ? 'neutral.800'
                            : 'neutral.300'
                        }
                        value={filterState.searchPantry}
                        onChange={(e) =>
                          onFilterChange({
                            ...filterState,
                            searchPantry: e.target.value,
                          })
                        }
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
                      {pantryOptions
                        .filter((pantry) =>
                          pantry
                            .toLowerCase()
                            .includes(filterState.searchPantry.toLowerCase()),
                        )
                        .map((pantry) => (
                          <Checkbox.Root
                            key={pantry}
                            checked={filterState.selectedPantries.includes(
                              pantry,
                            )}
                            onCheckedChange={(e: { checked: boolean }) =>
                              handleFilterChange(pantry, !!e.checked)
                            }
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
            </Box>

            <Box position="relative">
              <Button
                onClick={() => setIsSortOpen(!isSortOpen)}
                variant="outline"
                color="neutral.800"
                fontWeight="semibold"
                border="1px solid"
                borderColor="neutral.200"
                p={3}
                size="sm"
              >
                <ArrowDownUp />
                Sort
              </Button>

              {isSortOpen && (
                <>
                  <Box
                    position="fixed"
                    top={0}
                    left={0}
                    right={0}
                    bottom={0}
                    onClick={() => setIsSortOpen(false)}
                    zIndex={10}
                  />
                  <Box
                    position="absolute"
                    top="100%"
                    right={0}
                    mt={2}
                    bg="white"
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius="md"
                    boxShadow="lg"
                    p={2}
                    minW="120px"
                    zIndex={20}
                  >
                    <VStack
                      align="stretch"
                      color="neutral.800"
                      gap={1}
                      fontSize="12px"
                      fontFamily="Inter"
                      fontWeight="500"
                    >
                      <Box
                        cursor="pointer"
                        px={2}
                        py={1}
                        _hover={{ bg: 'gray.100' }}
                        onClick={() => {
                          onFilterChange({ ...filterState, sortAsc: false });
                          setIsSortOpen(false);
                        }}
                      >
                        Newest
                      </Box>
                      <Box
                        cursor="pointer"
                        px={2}
                        py={1}
                        _hover={{ bg: 'gray.100' }}
                        onClick={() => {
                          onFilterChange({ ...filterState, sortAsc: true });
                          setIsSortOpen(false);
                        }}
                      >
                        Oldest
                      </Box>
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
                  width="10%"
                >
                  Order #
                </Table.ColumnHeader>
                <Table.ColumnHeader
                  {...tableHeaderStyles}
                  borderRight="1px solid"
                  borderRightColor="neutral.100"
                  width="18%"
                >
                  Status
                </Table.ColumnHeader>
                <Table.ColumnHeader
                  {...tableHeaderStyles}
                  borderRight="1px solid"
                  borderRightColor="neutral.100"
                  width="7%"
                  textAlign="center"
                >
                  Assignee
                </Table.ColumnHeader>
                <Table.ColumnHeader
                  {...tableHeaderStyles}
                  borderRight="1px solid"
                  borderRightColor="neutral.100"
                  width="30%"
                >
                  Pantry
                </Table.ColumnHeader>
                <Table.ColumnHeader
                  {...tableHeaderStyles}
                  borderRight="1px solid"
                  borderRightColor="neutral.100"
                  width="15%"
                >
                  Dates
                </Table.ColumnHeader>
                <Table.ColumnHeader
                  {...tableHeaderStyles}
                  textAlign="right"
                  width="20%"
                >
                  Action Required
                </Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {orders.map((order, index) => {
                const pantry = order.request.pantry;
                const volunteers = pantry.volunteers || [];

                return (
                  <Table.Row
                    key={`${order.orderId}-${index}`}
                    _hover={{ bg: 'gray.50' }}
                  >
                    <Table.Cell
                      {...tableCellStyles}
                      borderRight="1px solid"
                      borderRightColor="neutral.100"
                    >
                      <Button
                        variant="plain"
                        fontWeight="400"
                        textDecoration="underline"
                        onClick={() => onOrderSelect(order.orderId)}
                      >
                        {order.orderId}
                      </Button>
                      {selectedOrderId === order.orderId && (
                        <OrderDetailsModal
                          order={order}
                          isOpen={true}
                          onClose={() => onOrderSelect(null)}
                        />
                      )}
                    </Table.Cell>
                    <Table.Cell
                      {...tableCellStyles}
                      borderRight="1px solid"
                      borderRightColor="neutral.100"
                    >
                      <Box
                        borderRadius="md"
                        bg={colors[0]}
                        color={colors[1]}
                        display="inline-block"
                        fontWeight="500"
                        my={2}
                        py={1}
                        px={3}
                      >
                        {capitalize(order.status)}
                      </Box>
                    </Table.Cell>
                    <Table.Cell
                      {...tableCellStyles}
                      borderRight="1px solid"
                      borderRightColor="neutral.100"
                    >
                      <Box
                        direction="row"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        {volunteers && volunteers.length > 0 ? (
                          <Box
                            key={index}
                            borderRadius="full"
                            bg={order.assigneeColor || 'gray'}
                            width="33px"
                            height="33px"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            color="white"
                            p={2}
                          >
                            {/* TODO: Change logic later to only get one volunteer */}
                            {volunteers[0].firstName.charAt(0).toUpperCase()}
                            {volunteers[0].lastName.charAt(0).toUpperCase()}
                          </Box>
                        ) : (
                          <Box>No Assignees</Box>
                        )}
                      </Box>
                    </Table.Cell>
                    <Table.Cell
                      {...tableCellStyles}
                      borderRight="1px solid"
                      borderRightColor="neutral.100"
                    >
                      {pantry.pantryName}
                    </Table.Cell>
                    <Table.Cell
                      {...tableCellStyles}
                      textAlign="left"
                      color="neutral.700"
                      borderRight="1px solid"
                      borderRightColor="neutral.100"
                    >
                      {formatDate(order.createdAt)}-
                      {order.deliveredAt && formatDate(order.deliveredAt)}
                    </Table.Cell>
                    <Table.Cell
                      {...tableCellStyles}
                      textAlign="left"
                      color="neutral.700"
                    >
                      {/* TODO: IMPLEMENT WHAT GOES HERE */}
                    </Table.Cell>
                  </Table.Row>
                );
              })}
            </Table.Body>
          </Table.Root>

          {totalPages > 1 && (
            <Box mt={4}>
              <Pagination.Root
                count={totalOrders}
                pageSize={MAX_PER_STATUS}
                page={currentPage}
                onPageChange={(e: { page: number }) => onPageChange(e.page)}
              >
                <ButtonGroup
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  variant="outline"
                  size="sm"
                >
                  <Pagination.PrevTrigger
                    color="neutral.800"
                    _hover={{ color: 'black' }}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft
                      size={16}
                      style={{
                        cursor: currentPage !== 1 ? 'pointer' : 'default',
                      }}
                    />
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
                    _hover={{ color: 'black' }}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight
                      size={16}
                      style={{
                        cursor:
                          currentPage !== totalPages ? 'pointer' : 'default',
                      }}
                    />
                  </Pagination.NextTrigger>
                </ButtonGroup>
              </Pagination.Root>
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default AdminOrderManagement;
