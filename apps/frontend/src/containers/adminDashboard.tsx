import ApiClient from '@api/apiClient';
import { Box, Heading, Text } from '@chakra-ui/react';
import DashboardCard, {
  DashboardCardType,
  DONATION_STATUS_BADGE,
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
  Donation,
  OrderSummary,
  PendingApplication,
  User,
} from '../types/types';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  const [alertState, setAlertMessage] = useAlert();
  const [loading, setLoading] = useState(true);
  const [pendingApplications, setPendingApplications] = useState<
    PendingApplication[]
  >([]);
  const [recentOrders, setRecentOrders] = useState<OrderSummary[]>([]);
  const [recentDonations, setRecentDonations] = useState<Donation[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const user = await ApiClient.getMe();
        setCurrentUser(user);
      } catch {
        setAlertMessage('Error fetching user data');
      }
    };

    const fetchPendingApplications = async () => {
      try {
        const applications = await ApiClient.getRecentPendingApplications();
        setPendingApplications(applications);
      } catch {
        setAlertMessage('Error fetching pending applications');
      }
    };

    const fetchRecentOrders = async () => {
      try {
        const allOrders = await ApiClient.getAllOrders();
        const sortedOrders = allOrders.sort(
          (a: OrderSummary, b: OrderSummary) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        setRecentOrders(sortedOrders.slice(0, 2));
      } catch {
        setAlertMessage('Error fetching recent orders');
      }
    };

    const fetchRecentDonations = async () => {
      try {
        const allDonations = await ApiClient.getAllDonations();
        const sortedDonations = allDonations.sort(
          (a: Donation, b: Donation) =>
            new Date(b.dateDonated).getTime() -
            new Date(a.dateDonated).getTime(),
        );
        setRecentDonations(sortedDonations.slice(0, 2));
      } catch {
        setAlertMessage('Error fetching recent donations');
      }
    };

    const load = async () => {
      try {
        await Promise.all([
          fetchMe(),
          fetchPendingApplications(),
          fetchRecentOrders(),
          fetchRecentDonations(),
        ]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [setAlertMessage]);

  if (loading) return null;

  const isPageEmpty =
    pendingApplications.length === 0 &&
    recentOrders.length === 0 &&
    recentDonations.length === 0;

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
        Welcome, {currentUser?.firstName} {currentUser?.lastName}
      </Heading>

      {isPageEmpty ? (
        <PageEmptyState
          entity="orders or applications to review"
          primaryButtonText="View Pantries"
          primaryButtonLink={ROUTES.PANTRY_MANAGEMENT}
          secondaryButtonText="View Donations"
          secondaryButtonLink={ROUTES.ADMIN_DONATION}
        />
      ) : (
        <>
          <Text textStyle="p" color="gray.light" fontWeight={600} mb={4}>
            Pending Actions
          </Text>
          {pendingApplications.length === 0 ? (
            <Box mb={16}>
              <SectionEmptyState entity="pending applications" />
            </Box>
          ) : (
            <Box
              display="grid"
              gridTemplateColumns="repeat(2, 1fr)"
              gap={4}
              mb={16}
            >
              {pendingApplications.map((application) => (
                <DashboardCard
                  type={DashboardCardType.ACTION}
                  title={application.name}
                  date={application.dateApplied}
                  key={application.id}
                  linkText="View Application Details"
                  badge={{
                    label:
                      application.type === 'pantry'
                        ? 'Pantry'
                        : 'Food Manufacturer',
                    bg: 'neutral.100',
                    color: 'neutral.600',
                  }}
                  onLinkClick={() => {
                    navigate(
                      application.type === 'pantry'
                        ? ROUTES.PANTRY_MANAGEMENT_DETAILS.replace(
                            ':pantryId',
                            application.id.toString(),
                          )
                        : ROUTES.FOOD_MANUFACTURER_APPLICATION_DETAILS.replace(
                            ':applicationId',
                            application.id.toString(),
                          ),
                    );
                  }}
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
                    navigate(`/admin-order-management?orderId=${order.orderId}`)
                  }
                />
              ))}
            </Box>
          )}

          <Text textStyle="p" color="gray.light" fontWeight={600} mb={4}>
            Recent Donations
          </Text>
          {recentDonations.length === 0 ? (
            <Box mb={16}>
              <SectionEmptyState entity="recent donations" />
            </Box>
          ) : (
            <Box
              display="grid"
              gridTemplateColumns="repeat(2, 1fr)"
              gap={4}
              mb={16}
            >
              {recentDonations.map((donation) => (
                <DashboardCard
                  key={donation.donationId}
                  type={DashboardCardType.RECENT_DONATION}
                  title={`Donation #${donation.donationId}`}
                  date={donation.dateDonated}
                  subtitle={donation.foodManufacturer?.foodManufacturerName}
                  linkText="View Donation Details"
                  badge={DONATION_STATUS_BADGE[donation.status]}
                  onLinkClick={() =>
                    navigate(
                      `/admin-donation?donationId=${donation.donationId}`,
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

export default AdminDashboard;
