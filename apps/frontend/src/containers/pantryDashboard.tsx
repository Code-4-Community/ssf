import React, { useEffect, useState } from 'react';
import { Box, Heading, Text } from '@chakra-ui/react';
import DashboardCard, { ORDER_STATUS_BADGE } from '@components/dashboardCard';
import {
  FoodRequestSummaryDto,
  OrderSummary,
  PantryWithUser,
} from '../types/types';
import { DashboardCardType } from '@components/dashboardCard';
import ApiClient from '@api/apiClient';
import { useAlert } from '../hooks/alert';
import { FloatingAlert } from '@components/floatingAlert';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../routes';

const PantryDashboard: React.FC = () => {
  const navigate = useNavigate();

  const [alertState, setAlertMessage] = useAlert();
  const [pantry, setPantry] = useState<PantryWithUser | null>(null);
  const [recentFoodRequests, setRecentFoodRequests] = useState<
    FoodRequestSummaryDto[]
  >([]);
  const [recentOrders, setRecentOrders] = useState<OrderSummary[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      let pantryId: number;
      try {
        pantryId = await ApiClient.getCurrentUserPantryId();
        const pantryData = await ApiClient.getPantry(pantryId);
        setPantry(pantryData);
      } catch {
        setAlertMessage('Error fetching pantry information');
        return;
      }

      try {
        const pantryFoodRequests = await ApiClient.getPantryRequests();
        const sortedFoodRequests = pantryFoodRequests.sort(
          (a: FoodRequestSummaryDto, b: FoodRequestSummaryDto) =>
            new Date(b.requestedAt).getTime() -
            new Date(a.requestedAt).getTime(),
        );
        setRecentFoodRequests(sortedFoodRequests.slice(0, 2));
      } catch {
        setAlertMessage('Error fetching pantry food requests');
      }

      try {
        const pantryOrders = await ApiClient.getPantryOrders();
        const sortedOrders = pantryOrders.sort(
          (a: OrderSummary, b: OrderSummary) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        setRecentOrders(sortedOrders.slice(0, 4));
      } catch {
        setAlertMessage('Error fetching orders');
      }
    };
    fetchDashboardData();
  }, [setAlertMessage]);

  if (!pantry) return null;

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
        Welcome, {pantry.pantryName}
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
            subtitle={pantry.pantryName}
            linkText="View Request Details"
            onLinkClick={() =>
              navigate(`${ROUTES.REQUEST_FORM}?requestId=${fr.requestId}`)
            }
          />
        ))}
      </Box>

      <Text textStyle="p" color="gray.light" fontWeight={600} mb={4}>
        Recent Orders
      </Text>
      <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap={4} mb={16}>
        {recentOrders.map((order) => (
          <DashboardCard
            key={order.orderId}
            type={DashboardCardType.ORDER}
            title={`Order #${order.orderId}`}
            date={order.createdAt}
            subtitle={order.request.pantry.pantryName}
            linkText="View Order Details"
            badge={ORDER_STATUS_BADGE[order.status]}
            assignee={{
              id: order.assignee.id,
              firstName: order.assignee.firstName,
              lastName: order.assignee.lastName,
            }}
            onLinkClick={() =>
              navigate(
                `${ROUTES.PANTRY_ORDER_MANAGEMENT}?orderId=${order.orderId}`,
              )
            }
          />
        ))}
      </Box>
    </Box>
  );
};

export default PantryDashboard;
