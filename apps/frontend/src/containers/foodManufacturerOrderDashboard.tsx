import React, { useEffect, useState } from 'react';
import {
  Center,
  Table,
  Tbody,
  Thead,
  Th,
  Tr,
  Td,
  Button,
  ButtonGroup,
  VStack,
} from '@chakra-ui/react';
import ApiClient from '@api/apiClient';
import { Order } from 'types/types';
import OrderInformationModal from '@components/forms/orderInformationModal';
import { formatDate } from '@utils/utils';

const FoodManufacturerOrderDashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderType, setOrderType] = useState<'current' | 'past'>('current');
  const [openOrderId, setOpenOrderId] = useState<number | null>(null);

  useEffect(() => {
    fetchOrders();
  }, [orderType]);

  const fetchOrders = async () => {
    try {
      const data =
        orderType === 'current'
          ? await ApiClient.getCurrentOrders()
          : await ApiClient.getPastOrders();
      setOrders(data);
    } catch (error) {
      alert('Error fetching orders: ' + error);
    }
  };

  const updateOrderStatus = async (
    orderId: number,
    newStatus: 'shipped' | 'delivered',
  ) => {
    try {
      await ApiClient.updateOrderStatus(orderId, newStatus);
      fetchOrders();
    } catch (error) {
      alert(`Error updating order status: ` + error);
    }
  };

  return (
    <Center flexDirection="column" p={4}>
      <VStack spacing={4} width="80%">
        <ButtonGroup>
          <Button
            colorScheme={orderType === 'current' ? 'blue' : 'gray'}
            onClick={() => setOrderType('current')}
          >
            Current Orders
          </Button>
          <Button
            colorScheme={orderType === 'past' ? 'blue' : 'gray'}
            onClick={() => setOrderType('past')}
          >
            Past Orders
          </Button>
        </ButtonGroup>

        <Table variant="simple" mt={6} width="100%">
          <Thead>
            <Tr>
              <Th>Order ID</Th>
              <Th>Date Placed</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {orders.map((order) => (
              <Tr key={order.orderId}>
                <Td>
                  <Button onClick={() => setOpenOrderId(order.orderId)}>
                    {order.orderId}
                  </Button>
                </Td>
                <Td>{formatDate(order.createdAt)}</Td>
                <Td>{order.status}</Td>
                <Td>
                  <ButtonGroup>
                    {order.status === 'pending' && (
                      <Button
                        colorScheme="blue"
                        size="sm"
                        onClick={() =>
                          updateOrderStatus(order.orderId, 'shipped')
                        }
                      >
                        Mark as Shipped
                      </Button>
                    )}
                  </ButtonGroup>
                </Td>
              </Tr>
            ))}
            {openOrderId && (
              <OrderInformationModal
                orderId={openOrderId}
                isOpen={openOrderId !== null}
                onClose={() => setOpenOrderId(null)}
              />
            )}
          </Tbody>
        </Table>
      </VStack>
    </Center>
  );
};

export default FoodManufacturerOrderDashboard;
