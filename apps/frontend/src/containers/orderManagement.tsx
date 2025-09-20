import { useEffect, useState } from 'react';
import ApiClient from '@api/apiClient';
import { Order } from 'types/types';

const OrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filters, setFilters] = useState<{
    status?: string;
    pantryName?: string;
  }>({});

  // Sorting logic
  const sortMethods = {
    'date-recent': (a: Order, b: Order) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    'date-oldest': (a: Order, b: Order) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  };

  const sortOrders = (method: 'date-recent' | 'date-oldest') => {
    const sorted = [...orders].sort(sortMethods[method]);
    setOrders(sorted);
  };

  // Filtering logic
  const applyFilter = (filterType: 'status' | 'pantryName', value: string) => {
    setFilters((prev) => {
      const newFilters = { ...prev, [filterType]: value };
      fetchOrders(newFilters.status, newFilters.pantryName);
      return newFilters;
    });
  };

  const removeFilter = (filterType: 'status' | 'pantryName') => {
    setFilters((prev) => {
      const newFilters = { ...prev };
      delete newFilters[filterType];
      fetchOrders(newFilters.status, newFilters.pantryName);
      return newFilters;
    });
  };

  // Fetch orders from API
  const fetchOrders = async (status?: string, pantryName?: string) => {
    try {
      const data = await ApiClient.getAllOrders(status, pantryName);
      setOrders(data);
    } catch (error) {
      alert('Error fetching orders: ' + error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return <div>Order Management</div>;
};

export default OrderManagement;
