import ApiClient from '@api/apiClient';
import { Box, Heading, Text } from '@chakra-ui/react';
import DashboardCard, {
  DashboardCardType,
  ORDER_STATUS_BADGE,
} from '@components/dashboardCard';
import { FloatingAlert } from '@components/floatingAlert';
import PageEmptyState from '@components/pageEmptyState';
import SectionEmptyState from '@components/sectionEmptyState';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAlert } from '../hooks/alert';
import { ROUTES } from '../routes';
import {
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

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const pantryId = await ApiClient.getCurrentUserPantryId();

        const fetchPantry = async () => {
          try {
            const pantryData = await ApiClient.getPantry(pantryId);
            setPantry(pantryData);
          } catch {
            setAlertMessage('Error fetching pantry data');
          }
        };

        const fetchFoodRequests = async () => {
          try {
            const pantryFoodRequests = await ApiClient.getPantryRequests(
              pantryId,
            );
            const sortedFoodRequests = pantryFoodRequests.sort(
              (a: FoodRequestSummaryDto, b: FoodRequestSummaryDto) =>
                new Date(b.requestedAt).getTime() -
                new Date(a.requestedAt).getTime(),
            );
            setRecentFoodRequests(sortedFoodRequests.slice(0, 2));
          } catch {
            setAlertMessage('Error fetching food requests');
          }
        };

        const fetchOrders = async () => {
          try {
            const pantryOrders = await ApiClient.getPantryOrders(pantryId);
            const sortedOrders = pantryOrders.sort(
              (a: OrderSummary, b: OrderSummary) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime(),
            );
            setRecentOrders(sortedOrders.slice(0, 4));
          } catch {
            setAlertMessage('Error fetching orders');
          }
        };

        await Promise.all([fetchPantry(), fetchFoodRequests(), fetchOrders()]);
      } catch {
        setAlertMessage('Error fetching pantry ID');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [setAlertMessage]);

  if (loading || !pantry) return null;

  const isPageEmpty =
    recentFoodRequests.length === 0 && recentOrders.length === 0;

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
          {recentFoodRequests.length === 0 ? (
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
