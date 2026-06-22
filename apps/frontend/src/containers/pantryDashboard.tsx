import React, { useEffect, useState } from 'react';
import { Box, Heading, Text } from '@chakra-ui/react';
import DashboardCard, { ORDER_STATUS_BADGE } from '@components/dashboardCard';
import {
  AlertStatus,
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
import SectionEmptyState from '@components/sectionEmptyState';
import PageEmptyState from '@components/pageEmptyState';
import { DashboardStats } from '@components/dashboardStats';

const PantryDashboard: React.FC = () => {
  const navigate = useNavigate();

  const [alertState, setAlertMessage] = useAlert();
  const [pantry, setPantry] = useState<PantryWithUser | null>(null);
  const [recentFoodRequests, setRecentFoodRequests] = useState<
    FoodRequestSummaryDto[]
  >([]);
  const [recentOrders, setRecentOrders] = useState<OrderSummary[]>([]);
  const [stats, setStats] = useState<Record<string, string> | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      let pantryId: number;
      try {
        pantryId = await ApiClient.getCurrentUserPantryId();
        const pantryData = await ApiClient.getPantry(pantryId);
        setPantry(pantryData);
      } catch {
        setAlertMessage('Error fetching pantry information', AlertStatus.ERROR);
        return;
      }

      try {
        const user = await ApiClient.getMe();
        const userStats = await ApiClient.getUserStats(user.id);
        setStats(userStats);
      } catch {
        setAlertMessage(
          'Error fetching dashboard statistics',
          AlertStatus.ERROR,
        );
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
        setAlertMessage(
          'Error fetching pantry food requests',
          AlertStatus.ERROR,
        );
      }

      try {
        const pantryOrders = await ApiClient.getPantryOrders();
        const sortedOrders = pantryOrders.sort(
          (a: OrderSummary, b: OrderSummary) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        setRecentOrders(sortedOrders.slice(0, 4));
      } catch {
        setAlertMessage('Error fetching orders', AlertStatus.ERROR);
      }
    };
    fetchDashboardData();
  }, [setAlertMessage]);

  if (!pantry) {
    return (
      <Box p={12}>
        <Heading textStyle="h1" color="gray.600" mb={6}>
          Pantry Dashboard
        </Heading>
        <PageEmptyState
          subtitle="Unable to load pantry information. Your pantry may not be set up yet."
          primaryButtonText="Create Food Request"
          primaryButtonLink={ROUTES.REQUEST_FORM}
          secondaryButtonText="View Orders"
          secondaryButtonLink={ROUTES.PANTRY_ORDER_MANAGEMENT}
        />
      </Box>
    );
  }

  const isPageEmpty =
    recentFoodRequests.length === 0 && recentOrders.length === 0;

  return (
    <Box p={12}>
      {alertState && (
        <FloatingAlert
          key={alertState.id}
          message={alertState.message}
          status={alertState.status}
          timeout={6000}
        />
      )}
      <Heading textStyle="h1" color="gray.600" mb={6}>
        Welcome, {pantry.pantryName}
      </Heading>

      {stats && <DashboardStats stats={stats} />}

      {isPageEmpty ? (
        <PageEmptyState
          subtitle="You have no food requests or orders at this time."
          primaryButtonText="Create Food Request"
          primaryButtonLink={ROUTES.REQUEST_FORM}
          secondaryButtonText="View Orders"
          secondaryButtonLink={ROUTES.PANTRY_ORDER_MANAGEMENT}
        />
      ) : (
        <>
          <Text textStyle="p" color="gray.light" fontWeight={600} mb={4}>
            Recent Food Requests
          </Text>
          {recentFoodRequests.length === 0 ? (
            <Box mb={16}>
              <SectionEmptyState subtitle="You have no recent food requests at this time" />
            </Box>
          ) : (
            <Box
              display="grid"
              gridTemplateColumns="repeat(2, 1fr)"
              gap={4}
              mb={16}
            >
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
          )}

          <Text textStyle="p" color="gray.light" fontWeight={600} mb={4}>
            Recent Orders
          </Text>
          {recentOrders.length === 0 ? (
            <Box mb={16}>
              <SectionEmptyState subtitle="You have no recent orders at this time" />
            </Box>
          ) : (
            <Box
              display="grid"
              gridTemplateColumns="repeat(2, 1fr)"
              gap={4}
              mb={16}
            >
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
          )}
        </>
      )}
    </Box>
  );
};

export default PantryDashboard;
