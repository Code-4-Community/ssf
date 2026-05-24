import React, { useEffect, useState } from 'react';
import { Box, Heading, Text } from '@chakra-ui/react';
import DashboardCard, {
  ORDER_STATUS_BADGE,
  DONATION_STATUS_BADGE,
} from '@components/dashboardCard';
import {
  PendingApplication,
  OrderSummary,
  Donation,
  User,
} from '../types/types';
import { DashboardCardType } from '@components/dashboardCard';
import ApiClient from '@api/apiClient';
import { useAlert } from '../hooks/alert';
import { FloatingAlert } from '@components/floatingAlert';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../routes';
import SectionEmptyState from '@components/SectionEmptyState';
import PageEmptyState from '@components/PageEmptyState';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  const [alertState, setAlertMessage] = useAlert();
  const [pendingApplications, setPendingApplications] = useState<
    PendingApplication[]
  >([]);
  const [recentOrders, setRecentOrders] = useState<OrderSummary[]>([]);
  const [recentDonations, setRecentDonations] = useState<Donation[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const fetchPendingApplications = async () => {
    try {
      const pendingApplications =
        await ApiClient.getRecentPendingApplications();
      setPendingApplications(pendingApplications);
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
      const recentOrders = sortedOrders.slice(0, 2);
      setRecentOrders(recentOrders);
    } catch {
      setAlertMessage('Error fetching orders');
    }
  };

  const fetchRecentDonations = async () => {
    try {
      const allDonations = await ApiClient.getAllDonations();
      const sortedDonations = allDonations.sort(
        (a: Donation, b: Donation) =>
          new Date(b.dateDonated).getTime() - new Date(a.dateDonated).getTime(),
      );
      const recentDonations = sortedDonations.slice(0, 2);
      setRecentDonations(recentDonations);
    } catch {
      setAlertMessage('Error fetching donations');
    }
  };

  const fetchMe = async () => {
    let user: User;
    try {
      user = await ApiClient.getMe();
      setCurrentUser(user);
    } catch {
      setAlertMessage('Authentication error. Please log in and try again.');
      return;
    }
  };

  useEffect(() => {
    fetchMe();
    fetchRecentDonations();
    fetchRecentOrders();
    fetchPendingApplications();
  }, [setAlertMessage]);

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
          subtitle="You have no orders or applications to review at this time."
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
              <SectionEmptyState subtitle="You have no pending applications at this time" />
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
              <SectionEmptyState subtitle="You have no recent donations at this time" />
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
