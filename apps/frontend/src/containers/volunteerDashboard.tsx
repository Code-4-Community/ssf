import React, { useEffect, useState } from 'react';
import { Box, Heading, Text } from '@chakra-ui/react';
import DashboardCard, { ORDER_STATUS_BADGE } from '@components/dashboardCard';
import { FoodRequestSummaryDto, User, VolunteerOrder } from '../types/types';
import { DashboardCardType } from '@components/dashboardCard';
import ApiClient from '@api/apiClient';
import { useAlert } from '../hooks/alert';
import { FloatingAlert } from '@components/floatingAlert';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../routes';

const VolunteerDashboard: React.FC = () => {
  const navigate = useNavigate();

  const [alertState, setAlertMessage] = useAlert();
  const [user, setUser] = useState<User | null>(null);
  const [recentFoodRequests, setRecentFoodRequests] = useState<
    FoodRequestSummaryDto[]
  >([]);
  const [recentOrders, setRecentOrders] = useState<VolunteerOrder[]>([]);

  const fetchRecentFoodRequests = async () => {
    try {
      const requests = await ApiClient.getVolunteerAssignedRequests();
      const sorted = requests.sort(
        (a: FoodRequestSummaryDto, b: FoodRequestSummaryDto) =>
          new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime(),
      );
      setRecentFoodRequests(sorted.slice(0, 2));
    } catch {
      setAlertMessage('Error fetching food requests');
    }
  };

  const fetchRecentOrders = async () => {
    try {
      const orders = await ApiClient.getVolunteerRecentOrders();
      setRecentOrders(orders);
    } catch {
      setAlertMessage('Error fetching orders');
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const currentUser = await ApiClient.getMe();
        setUser(currentUser);
      } catch {
        setAlertMessage('Error fetching user information');
        return;
      }
      fetchRecentFoodRequests();
      fetchRecentOrders();
    };
    fetchDashboardData();
  }, [setAlertMessage]);

  if (!user) return null;

  return (
    <Box p={12}>
      {alertState && (
        <FloatingAlert
          key={alertState.id}
          message={alertState.message}
          status={'error'}
          timeout={6000}
        />
      )}
      <Heading textStyle="h1" color="gray.600" mb={6}>
        Welcome, {user.firstName} {user.lastName}
      </Heading>

      <Text textStyle="p" color="gray.light" fontWeight={600} mb={4}>
        Recent Food Requests
      </Text>
      <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap={4} mb={16}>
        {recentFoodRequests.map((fr) => (
          <DashboardCard
            key={fr.requestId}
            type={DashboardCardType.FOOD_REQUEST}
            title={`Request #${fr.requestId}`}
            date={fr.requestedAt}
            subtitle={fr.pantry.pantryName}
            linkText="Fulfill Request"
            onLinkClick={() =>
              navigate(
                `${ROUTES.VOLUNTEER_REQUEST_MANAGEMENT}?requestId=${fr.requestId}`,
              )
            }
          />
        ))}
      </Box>

      <Text textStyle="p" color="gray.light" fontWeight={600} mb={4}>
        My Orders
      </Text>
      <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap={4} mb={16}>
        {recentOrders.map((order) => (
          <DashboardCard
            key={order.orderId}
            type={DashboardCardType.ORDER}
            title={`Order #${order.orderId}`}
            date={order.createdAt}
            subtitle={order.pantryName}
            linkText="View Order Details"
            badge={ORDER_STATUS_BADGE[order.status]}
            assignee={{
              id: order.assignee.id,
              firstName: order.assignee.firstName,
              lastName: order.assignee.lastName,
            }}
            onLinkClick={() =>
              navigate(
                `${ROUTES.VOLUNTEER_ORDER_MANAGEMENT}?orderId=${order.orderId}`,
              )
            }
          />
        ))}
      </Box>
    </Box>
  );
};

export default VolunteerDashboard;
