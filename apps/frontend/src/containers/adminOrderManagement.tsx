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
} from '@chakra-ui/react';
import {
  ArrowDownUp,
  ChevronRight,
  ChevronLeft,
  Funnel,
  Mail,
} from 'lucide-react';
import { formatDate } from '@utils/utils';
import ApiClient from '@api/apiClient';
import { Order, OrderStatus } from '../types/types';
import OrderDetailsModal from '@components/forms/orderDetailsModal';

const AdminOrderManagement: React.FC = () => {
  const [statusOrders, setStatusOrders] = useState<Record<string, Order[]>>({});
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const STATUS_ORDER = [OrderStatus.PENDING, OrderStatus.SHIPPED, OrderStatus.DELIVERED];
  // Map of colors as per status (background color, text color)
  const STATUS_COLORS = {
    [OrderStatus.PENDING]: ['#FEECD1', '#9C5D00'],
    [OrderStatus.SHIPPED]: ['#D5DCDF', '#2B4E60'],
    [OrderStatus.DELIVERED]: ['#D4EAED', '#19717D']
  };

  const MAX_PER_STATUS = 5;

  const totalPages =
    Math.max(
      ...Object.values(statusOrders).map((orders) =>
        Math.ceil(orders.length / MAX_PER_STATUS),
      ),
    ) || 1;

  const displayedStatusOrders = Object.fromEntries(
    Object.entries(statusOrders).map(([status, orders]) => [
      status,
      orders.slice(
        (currentPage - 1) * MAX_PER_STATUS,
        currentPage * MAX_PER_STATUS,
      ),
    ]),
  );

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await ApiClient.getAllOrders();

        // Build the grouped object first
        const grouped: Record<string, Order[]> = {};

        for (const order of data) {
          const status = order.status;
          if (!grouped[status]) grouped[status] = [];
          grouped[status].push(order);
        }

        // Set state once
        setStatusOrders(grouped);
      } catch (error) {
        alert('Error fetching orders: ' + error);
      }
    };

    fetchOrders();
  }, []);

  return (
    <Box p={12}>
      <Heading
        textStyle="h1"
        color="gray.600"
        mb={8}
      >
        Order Management
      </Heading>

      {STATUS_ORDER.map((status, index) => {
        const orders = displayedStatusOrders[status] || [];
        if (orders.length === 0) return null;

        return (
          <Box key={status} mb={12}>
            <OrderTableSection
              key={status}
              orders={orders}
              colors={STATUS_COLORS[orders[0].status]}
              selectedOrderId={selectedOrderId}
              onOrderSelect={setSelectedOrderId}
            />
          </Box>
        );
      })}

      <Pagination.Root
        count={totalPages * MAX_PER_STATUS}
        pageSize={MAX_PER_STATUS}
        page={currentPage}
        onPageChange={(e) => setCurrentPage(e.page)}
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
            _hover={{ color: 'black' }}
          >
            <ChevronLeft size={16} />
          </Pagination.PrevTrigger>

          <Pagination.Items
            render={(page) => (
              <IconButton
                borderColor={{ base: 'neutral.100', _selected: 'neutral.600' }}
              >
                {page.value}
              </IconButton>
            )}
          />

          <Pagination.NextTrigger
            color="neutral.800"
            _hover={{ color: 'black' }}
          >
            <ChevronRight size={16} />
          </Pagination.NextTrigger>
        </ButtonGroup>
      </Pagination.Root>
    </Box>
  );
};

interface OrderTableSectionProps {
  orders: Order[];
  colors: string[];
  onOrderSelect: (orderId: number | null) => void;
  selectedOrderId: number | null;
}

const OrderTableSection: React.FC<OrderTableSectionProps> = ({
  orders,
  colors,
  onOrderSelect,
  selectedOrderId,
}) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [selectedPantries, setSelectedPantries] = useState<string[]>([]);
  const [sortAsc, setSortAsc] = useState(true);

  const ASSIGNEE_COLORS = ['#F89E19', '#CC3538', '#2795A5', '#2B4E60'];

  const pantryOptions = [
    ...new Set(orders.map((o) => o.pantry.pantryName)),
  ].sort((a, b) => a.localeCompare(b));

  const handleFilterChange = (pantry: string, checked: boolean) => {
    setSelectedPantries((prev) =>
      checked ? [...prev, pantry] : prev.filter((p) => p !== pantry),
    );
  };

  // Filter and sort the orders based on properties defined above (display this in the UI)
  const filteredOrders = orders
    .filter(
      (o) =>
        selectedPantries.length === 0 ||
        selectedPantries.includes(o.pantry.pantryName),
    )
    .sort((a, b) =>
      sortAsc
        ? a.createdAt.localeCompare(b.createdAt)
        : b.createdAt.localeCompare(a.createdAt),
    );

  const tableHeaderStyles = {
    borderBottom: '1px solid',
    borderColor: 'neutral.100',
    color: 'neutral.800',
    fontFamily: "ibm",
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
        <Box ml={3} fontFamily="ibm" fontSize="14px" fontWeight="semibold" color="neutral.700">
          {orders[0].status.charAt(0).toUpperCase() + orders[0].status.slice(1)}
        </Box>
      </Box>
      <Box
        display="flex"
        justifyContent="flex-end"
        alignItems="center"
        gap={2}
        mb={3}
        position="relative"
        fontFamily="'Inter', sans-serif"
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
                maxH="150px"
                overflowY="auto"
                zIndex={20}
              >
                <VStack align="stretch" fontSize="12px" fontFamily="Inter" color="neutral.800" fontWeight="500" gap={2}>
                  {pantryOptions.map((pantry) => (
                    <Checkbox.Root
                      key={pantry}
                      checked={selectedPantries.includes(pantry)}
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
                <VStack align="stretch" color="neutral.800" gap={1}>
                  <Box
                    cursor="pointer"
                    px={2}
                    py={1}
                    _hover={{ bg: 'gray.100' }}
                    onClick={() => {
                      setSortAsc(false);
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
                      setSortAsc(true);
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
              width="25%"
            >
              Pantry
            </Table.ColumnHeader>
            <Table.ColumnHeader
              {...tableHeaderStyles}
              borderRight="1px solid"
              borderRightColor="neutral.100"
              width="15%"
            >
              Assignee
            </Table.ColumnHeader>
            <Table.ColumnHeader
              {...tableHeaderStyles}
              borderRight="1px solid"
              borderRightColor="neutral.100"
              width="15%"
            >
              Status
            </Table.ColumnHeader>
            <Table.ColumnHeader
              {...tableHeaderStyles}
              textAlign="right"
              width="25%"
            >
              Date Started
            </Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {filteredOrders.map((order, index) => (
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
                {order.pantry.pantryName}
              </Table.Cell>
              <Table.Cell
                {...tableCellStyles}
                borderRight="1px solid"
                borderRightColor="neutral.100"
              >
                <Box direction="row" gap={1} display="flex" alignItems="center">
                  {order.pantry.volunteers &&
                  order.pantry.volunteers.length > 0 ? (
                    order.pantry.volunteers
                      .slice(0, 5)
                      .map((volunteer, index) => (
                        <Box
                          key={index}
                          borderRadius="full"
                          bg={
                            ASSIGNEE_COLORS[
                              Math.floor(Math.random() * ASSIGNEE_COLORS.length)
                            ]
                          }
                          width="33px"
                          height="33px"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          color="white"
                          p={2}
                        >
                          {volunteer.firstName.charAt(0).toUpperCase()}
                          {volunteer.lastName.charAt(0).toUpperCase()}
                        </Box>
                      ))
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
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Box>
              </Table.Cell>
              <Table.Cell
                {...tableCellStyles}
                textAlign="right"
                color="neutral.700"
              >
                {formatDate(order.createdAt)}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Box>
  );
};

export default AdminOrderManagement;
