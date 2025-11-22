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
import { Order } from 'types/types';
import OrderDetailsModal from '@components/forms/orderDetailsModal';

interface OrderTableSectionProps {
  orders: Order[];
  status: string;
  color: string;
  onOrderSelect: (orderId: number | null) => void;
  selectedOrderId: number | null;
}

const OrderTableSection: React.FC<OrderTableSectionProps> = ({
  orders,
  status,
  color,
  onOrderSelect,
  selectedOrderId,
}) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [selectedPantries, setSelectedPantries] = useState<string[]>([]);
  const [sortAsc, setSortAsc] = useState(true);

  const assigneeColors = ['#F89E19', '#CC3538', '#2795A5', '#2B4E60'];

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
    fontFamily: "'Inter', sans-serif",
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
        backgroundColor={color}
        p={3}
        borderRadius="md"
        minW="fit-content"
      >
        <Mail size={18} />
        <Box ml={3}>{status}</Box>
      </Box>
      <Box
        display="flex"
        justifyContent="flex-end"
        alignItems="center"
        gap={2}
        mb={6}
        position="relative"
        fontFamily="'Inter', sans-serif"
      >
        <Box position="relative">
          <Button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            variant="outline"
            color="neutral.600"
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
                <VStack align="stretch" gap={2}>
                  {pantryOptions.map((pantry) => (
                    <Checkbox.Root
                      key={pantry}
                      checked={selectedPantries.includes(pantry)}
                      onCheckedChange={(e) =>
                        handleFilterChange(pantry, !!e.checked)
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

        <Box position="relative">
          <Button
            onClick={() => setIsSortOpen(!isSortOpen)}
            variant="outline"
            color="neutral.600"
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
                <VStack align="stretch" gap={1}>
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
                  textDecoration="underline"
                  onClick={() => onOrderSelect(order.orderId)}
                >
                  {order.orderId}
                </Button>
                {selectedOrderId === order.orderId && (
                  <OrderDetailsModal
                    orderId={selectedOrderId}
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
                <Box
                  borderRadius="full"
                  bg={
                    assigneeColors[
                      Math.floor(Math.random() * assigneeColors.length)
                    ]
                  }
                  width="38px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  my={2}
                  p={2}
                >
                  {order.pantry.ssfRepresentative.firstName[0]}
                  {order.pantry.ssfRepresentative.lastName[0]}
                </Box>
              </Table.Cell>
              <Table.Cell
                {...tableCellStyles}
                borderRight="1px solid"
                borderRightColor="neutral.100"
              >
                <Box
                  borderRadius="md"
                  bg={color}
                  display="inline-block"
                  my={2}
                  p={1}
                >
                  {status}
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

const AdminOrderManagement: React.FC = () => {
  const [statusOrders, setStatusOrders] = useState<Record<string, Order[]>>({});
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const STATUS_ORDER = ['pending', 'shipped', 'delivered'];
  const STATUS_COLORS = ['#FEECD1', '#D5DCDF', '#D4EAED'];
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
        size="4xl"
        color="gray.600"
        fontWeight="normal"
        mb={6}
        fontFamily="'Instrument Serif', serif"
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
              status={status.charAt(0).toUpperCase() + status.slice(1)} // Capitalize first letter
              color={STATUS_COLORS[index % STATUS_COLORS.length]}
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

export default AdminOrderManagement;
