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
import { FoodRequestSummaryDto, User, VolunteerOrder } from '../types/types';

const VolunteerDashboard: React.FC = () => {
  const navigate = useNavigate();

  const [alertState, setAlertMessage] = useAlert();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [recentFoodRequests, setRecentFoodRequests] = useState<
    FoodRequestSummaryDto[]
  >([]);
  const [recentOrders, setRecentOrders] = useState<VolunteerOrder[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const currentUser = await ApiClient.getMe();
        setUser(currentUser);

        const [requests, orders] = await Promise.all([
          ApiClient.getVolunteerAssignedRequests(),
          ApiClient.getVolunteerRecentOrders(),
        ]);

        const sorted = requests.sort(
          (a: FoodRequestSummaryDto, b: FoodRequestSummaryDto) =>
            new Date(b.requestedAt).getTime() -
            new Date(a.requestedAt).getTime(),
        );
        setRecentFoodRequests(sorted.slice(0, 2));
        setRecentOrders(orders);
      } catch {
        setAlertMessage('Error fetching dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [setAlertMessage]);

  if (loading || !user) return null;

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
        Welcome, {user.firstName} {user.lastName}
      </Heading>

      {isPageEmpty ? (
        <PageEmptyState
          entity="food requests or orders"
          primaryButtonText="View Pantries"
          primaryButtonLink={ROUTES.VOLUNTEER_ASSIGNED_PANTRIES}
          secondaryButtonText="View Past Orders"
          secondaryButtonLink={ROUTES.VOLUNTEER_ORDER_MANAGEMENT}
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
          )}

          <Text textStyle="p" color="gray.light" fontWeight={600} mb={4}>
            My Orders
          </Text>
          {recentOrders.length === 0 ? (
            <Box mb={16}>
              <SectionEmptyState entity="orders" />
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
          )}
        </>
      )}
    </Box>
  );
};

export default VolunteerDashboard;
