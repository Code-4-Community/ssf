import { useEffect, useState } from 'react';
import ApiClient from '@api/apiClient';
import { Order } from 'types/types';

const OrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);

  const fetchDonations = async () => {
    try {
      const data = await ApiClient.getAllOrders();
      setOrders(data);
    } catch (error) {
      alert('Error fetching orders: ' + error);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  return <div>Order Management</div>;
};

export default OrderManagement;
