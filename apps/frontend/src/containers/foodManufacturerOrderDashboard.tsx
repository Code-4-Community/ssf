import React, { useEffect, useState } from 'react';
import { Center, Table, Button, ButtonGroup, VStack } from '@chakra-ui/react';
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
      <VStack gap={4} width="80%">
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

        <Table.Root mt={6} width="100%">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>Order ID</Table.ColumnHeader>
              <Table.ColumnHeader>Date Placed</Table.ColumnHeader>
              <Table.ColumnHeader>Status</Table.ColumnHeader>
              <Table.ColumnHeader>Actions</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {orders.map((order) => (
              <Table.Row key={order.orderId}>
                <Table.Cell>
                  <Button 
                    onClick={() => setOpenOrderId(order.orderId)}
                    bg="neutral.100"
                    color="black"
                  >
                    {order.orderId}
                  </Button>
                </Table.Cell>
                <Table.Cell>{formatDate(order.createdAt)}</Table.Cell>
                <Table.Cell>{order.status}</Table.Cell>
                <Table.Cell>
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
                </Table.Cell>
              </Table.Row>
            ))}
            {openOrderId && (
              <OrderInformationModal
                orderId={openOrderId}
                isOpen={openOrderId !== null}
                onClose={() => setOpenOrderId(null)}
              />
            )}
          </Table.Body>
        </Table.Root>
      </VStack>
    </Center>
  );
};

export default FoodManufacturerOrderDashboard;
