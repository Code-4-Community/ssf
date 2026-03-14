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
} from '@chakra-ui/react';
import {
  ArrowDownUp,
  ChevronRight,
  ChevronLeft,
  Mail,
  CircleCheck,
} from 'lucide-react';
import { capitalize, formatDate } from '@utils/utils';
import ApiClient from '@api/apiClient';
import { OrderStatus, OrderWithoutFoodManufacturer } from '../types/types';
import OrderReceivedActionModal from '@components/forms/orderReceivedActionModal';
import OrderDetailsModal from '@components/forms/orderDetailsModal';
import { FloatingAlert } from '@components/floatingAlert';

type OrderWithColor = OrderWithoutFoodManufacturer & { assigneeColor?: string };
const MAX_PER_STATUS = 5;

const PantryOrderManagement: React.FC = () => {
  // State to hold orders grouped by status
  const [statusOrders, setStatusOrders] = useState<
    Record<OrderStatus, OrderWithColor[]>
  >({
    [OrderStatus.SHIPPED]: [],
    [OrderStatus.PENDING]: [],
    [OrderStatus.DELIVERED]: [],
  });

  // State to hold selected order for details modal
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  const [selectedActionOrder, setSelectedActionOrder] =
    useState<OrderWithColor | null>(null);

  // State to hold current page per status
  const [currentPages, setCurrentPages] = useState<Record<OrderStatus, number>>(
    {
      [OrderStatus.SHIPPED]: 1,
      [OrderStatus.PENDING]: 1,
      [OrderStatus.DELIVERED]: 1,
    },
  );

  const [alert, setAlert] = useState<{
    isError: boolean;
    message: string;
  }>({
    isError: true,
    message: '',
  });

  // State to hold filter state per status
  type FilterState = {
    sortAsc: boolean;
  };

  // Record to store the filter state for each status
  // sortAsc indicates whether the sorting is ascending (oldest first) or descending (newest first)
  // We store all these here to determine what orders to display for each status
  const [filterStates, setFilterStates] = useState<
    Record<OrderStatus, FilterState>
  >({
    [OrderStatus.SHIPPED]: {
      sortAsc: true,
    },
    [OrderStatus.PENDING]: {
      sortAsc: true,
    },
    [OrderStatus.DELIVERED]: {
      sortAsc: true,
    },
  });

  // Color mapping for statuses, the first color is background, the second is color for status text
  const STATUS_COLORS = new Map<OrderStatus, [string, string]>([
    [OrderStatus.SHIPPED, ['yellow.200', 'yellow.hover']],
    [OrderStatus.PENDING, ['blue.200', 'blue.core']],
    [OrderStatus.DELIVERED, ['teal.200', 'teal.hover']],
  ]);

  const fetchOrders = async () => {
    try {
      const pantryId = await ApiClient.getCurrentUserPantryId();
      const data = await ApiClient.getPantryOrders(pantryId);

      const grouped: Record<OrderStatus, OrderWithColor[]> = {
        [OrderStatus.SHIPPED]: [],
        [OrderStatus.PENDING]: [],
        [OrderStatus.DELIVERED]: [],
      };

      for (const order of data) {
        const status = order.status;

        const orderWithColor: OrderWithColor = { ...order };

        grouped[status].push(orderWithColor);
      }

      setStatusOrders(grouped);

      // Initialize current page for each status
      const initialPages: Record<OrderStatus, number> = {
        [OrderStatus.SHIPPED]: 1,
        [OrderStatus.PENDING]: 1,
        [OrderStatus.DELIVERED]: 1,
      };
      setCurrentPages(initialPages);
    } catch (error) {
      setAlert({ isError: true, message: 'Error fetching orders: ' + error });
    }
  };

  useEffect(() => {
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

      {alert && (
        <FloatingAlert
          message={alert.message}
          status={alert.isError ? 'error' : 'info'}
          timeout={6000}
        />
      )}

      {Object.values(OrderStatus).map((status) => {
        const allOrders = statusOrders[status] || [];
        const filterState = filterStates[status];

        // Apply filters and sorting to all orders
        const filteredOrders = allOrders.sort((a, b) =>
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
              onOrderSelect={setSelectedOrderId}
              onOrderSelectForAction={setSelectedActionOrder}
              totalOrders={totalFiltered}
              currentPage={currentPage}
              onPageChange={(page) => handlePageChange(status, page)}
              filterState={filterState}
              onFilterChange={(newState: FilterState) =>
                // Update filter state for the specific status
                setFilterStates((prev) => {
                  const prevSort = prev[status]?.sortAsc;
                  if (prevSort !== newState.sortAsc) resetPageForStatus(status);
                  return { ...prev, [status]: newState };
                })
              }
            />
          </Box>
        );
      })}

      <OrderDetailsModal
        orderId={selectedOrderId!}
        isOpen={!!selectedOrderId}
        onClose={() => setSelectedOrderId(null)}
      />

      {selectedActionOrder && (
        <OrderReceivedActionModal
          orderId={selectedActionOrder.orderId}
          orderCreatedAt={selectedActionOrder.createdAt}
          isOpen={true}
          onClose={() => setSelectedActionOrder(null)}
          onSuccess={() => {
            fetchOrders();
            setAlert({
              isError: false,
              message: 'Delivery Confirmed',
            });
          }}
          onError={() => {
            setAlert({
              isError: true,
              message: 'Delivery could not be confirmed.',
            });
          }}
        />
      )}
    </Box>
  );
};

interface OrderStatusSectionProps {
  orders: OrderWithColor[];
  status: OrderStatus;
  colors: [string, string];
  onOrderSelect: (orderId: number | null) => void;
  onOrderSelectForAction: (order: OrderWithColor | null) => void;
  totalOrders: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  filterState: {
    sortAsc: boolean;
  };
  onFilterChange: (newState: { sortAsc: boolean }) => void;
}

const OrderStatusSection: React.FC<OrderStatusSectionProps> = ({
  orders,
  status,
  colors,
  onOrderSelect,
  onOrderSelectForAction,
  totalOrders,
  currentPage,
  onPageChange,
  filterState,
  onFilterChange,
}) => {
  const [isSortOpen, setIsSortOpen] = useState(false);

  const totalPages = Math.ceil(totalOrders / MAX_PER_STATUS);

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
                >
                  Assignee
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
              {orders.map((order) => {
                return (
                  <Table.Row key={order.orderId} _hover={{ bg: 'gray.50' }}>
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
                      {/* TODO: Add assignee column handling */}
                    </Table.Cell>
                    <Table.Cell
                      {...tableCellStyles}
                      textAlign="left"
                      color="neutral.700"
                      borderRight="1px solid"
                      borderRightColor="neutral.100"
                    >
                      {formatDate(order.createdAt)}-
                      {order.deliveredAt &&
                        formatDate(new Date(order.deliveredAt).toISOString())}
                    </Table.Cell>
                    <Table.Cell
                      {...tableCellStyles}
                      textAlign="right"
                      color="neutral.700"
                      bgColor={
                        order.status !== OrderStatus.SHIPPED
                          ? 'neutral.50'
                          : 'white'
                      }
                      pr={0}
                    >
                      {order.status === OrderStatus.SHIPPED && (
                        <Button
                          variant="plain"
                          fontWeight="400"
                          textDecoration="underline"
                          onClick={() => onOrderSelectForAction(order)}
                        >
                          Complete Required Action
                        </Button>
                      )}
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

export default PantryOrderManagement;
