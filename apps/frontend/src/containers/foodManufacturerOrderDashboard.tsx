import React, { useEffect, useState } from 'react';
import { Center, Table, Tbody, Thead, Th, Tr, Td } from '@chakra-ui/react';
import ApiClient from '@api/apiClient';
import { Order } from 'types/types';

const FoodManufacturerOrderDashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);

  const fetchOrders = async () => {
    try {
      const data = await ApiClient.getAllOrders();
      setOrders(data);
    } catch (error) {
      alert('Error fetching unapproved orders: ' + error);
    }
  };

  const updateOrderStatus = async (
    orderId: number,
    newStatus: 'shipped' | 'delivered',
  ) => {
    try {
      await ApiClient.updateOrderStatus(orderId, newStatus);
    } catch (error) {
      alert(`Error ${newStatus} order: ` + error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <Center flexDirection="column" p={4}>
      <Table variant="simple" mt={6} width="80%">
        <Thead>
          <Tr>
            <Th>Order Id</Th>
            <Th>Date Placed</Th>
            <Th>Status</Th>
          </Tr>
        </Thead>
        <Tbody>
          {orders.map((order) => (
            <Tr key={order.orderId}>
              <Td>{order.orderId}</Td>
              <Td>{formatDate(order.createdAt)}</Td>
              <Td>{order.status}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Center>
  );
};

export default FoodManufacturerOrderDashboard;
