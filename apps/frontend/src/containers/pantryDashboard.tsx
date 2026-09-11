import ApiClient from '@api/apiClient';
import { Box, Button, Heading, Text } from '@chakra-ui/react';
import DashboardCard, {
  DashboardCardType,
  ORDER_STATUS_BADGE,
} from '@components/dashboardCard';
import { FloatingAlert } from '@components/floatingAlert';
import PageEmptyState from '@components/pageEmptyState';
import SectionEmptyState from '@components/sectionEmptyState';
import { DashboardStats } from '@components/dashboardStats';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAlert } from '../hooks/alert';
import { ROUTES } from '../routes';
import {
  AlertStatus,
  FoodRequestStatus,
  FoodRequestSummaryDto,
  OrderSummary,
  PantryWithUser,
} from '../types/types';

const PantryDashboard: React.FC = () => {
  const navigate = useNavigate();

  const [alertState, setAlertMessage] = useAlert();
  const [loading, setLoading] = useState(true);
  const [pantry, setPantry] = useState<PantryWithUser | null>(null);
  const [recentFoodRequests, setRecentFoodRequests] = useState<
    FoodRequestSummaryDto[]
  >([]);
  const [recentOrders, setRecentOrders] = useState<OrderSummary[]>([]);
  const [stats, setStats] = useState<Record<string, string> | null>(null);
  const [recentFoodRequestsFailed, setRecentFoodRequestsFailed] =
    useState(false);
  const [recentOrdersFailed, setRecentOrdersFailed] = useState(false);

  const fetchFoodRequests = React.useCallback(async () => {
    setRecentFoodRequestsFailed(false);
    try {
      const pantryFoodRequests = await ApiClient.getPantryRequests();
      const sortedFoodRequests = pantryFoodRequests
        .filter(
          (fr: FoodRequestSummaryDto) => fr.status === FoodRequestStatus.ACTIVE,
        )
        .sort(
          (a: FoodRequestSummaryDto, b: FoodRequestSummaryDto) =>
            new Date(b.requestedAt).getTime() -
            new Date(a.requestedAt).getTime(),
        );
      setRecentFoodRequests(sortedFoodRequests.slice(0, 2));
    } catch {
      setRecentFoodRequestsFailed(true);
      setAlertMessage('Error fetching food requests', AlertStatus.ERROR);
    }
  }, [setAlertMessage]);

  const fetchOrders = React.useCallback(async () => {
    setRecentOrdersFailed(false);
    try {
      const pantryOrders = await ApiClient.getPantryOrders();
      const sortedOrders = pantryOrders.sort(
        (a: OrderSummary, b: OrderSummary) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      setRecentOrders(sortedOrders.slice(0, 4));
    } catch {
      setRecentOrdersFailed(true);
      setAlertMessage('Error fetching orders', AlertStatus.ERROR);
    }
  }, [setAlertMessage]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const pantryId = await ApiClient.getCurrentUserPantryId();

        const fetchPantry = async () => {
          try {
            const pantryData = await ApiClient.getPantry(pantryId);
            setPantry(pantryData);
          } catch {
            setAlertMessage('Error fetching pantry data', AlertStatus.ERROR);
          }
        };

        await Promise.all([fetchPantry(), fetchFoodRequests(), fetchOrders()]);

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
      } catch {
        setAlertMessage('Error fetching pantry ID', AlertStatus.ERROR);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [setAlertMessage, fetchFoodRequests, fetchOrders]);

  if (loading) return null;

  const isPageEmpty =
    recentFoodRequests.length === 0 &&
    !recentFoodRequestsFailed &&
    recentOrders.length === 0 &&
    !recentOrdersFailed;

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
        Welcome, {pantry?.pantryName}
      </Heading>

      {stats && <DashboardStats stats={stats} />}

      {isPageEmpty ? (
        <PageEmptyState
          entity="food requests or orders"
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
          {recentFoodRequestsFailed ? (
            <Box mb={16}>
              <SectionEmptyState
                entity="recent food requests"
                subtitle="We couldn't load recent food requests. Please try again."
              />
              <Box display="flex" justifyContent="center">
                <Button onClick={fetchFoodRequests} variant="outline">
                  Retry
                </Button>
              </Box>
            </Box>
          ) : recentFoodRequests.length === 0 ? (
            <Box mb={16}>
              <SectionEmptyState entity="recent food requests" />
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
                  subtitle={pantry?.pantryName}
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
          {recentOrdersFailed ? (
            <Box mb={16}>
              <SectionEmptyState
                entity="recent orders"
                subtitle="We couldn't load recent orders. Please try again."
              />
              <Box display="flex" justifyContent="center">
                <Button onClick={fetchOrders} variant="outline">
                  Retry
                </Button>
              </Box>
            </Box>
          ) : recentOrders.length === 0 ? (
            <Box mb={16}>
              <SectionEmptyState entity="recent orders" />
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
                  assignee={
                    order.assignee
                      ? {
                          id: order.assignee.id,
                          firstName: order.assignee.firstName,
                          lastName: order.assignee.lastName,
                          active: order.assignee.active,
                        }
                      : undefined
                  }
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
