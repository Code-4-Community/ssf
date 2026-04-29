import React, { useEffect, useState } from 'react';
import { Box, Heading, Text } from '@chakra-ui/react';
import DashboardCard, {
  ORDER_STATUS_BADGE,
  DONATION_STATUS_BADGE,
} from '@components/dashboardCard';
import { PendingApplication, OrderSummary, Donation } from '../types/types';
import { DashboardCardType } from '@components/dashboardCard';
import ApiClient from '@api/apiClient';
import { useAlert } from '../hooks/alert';
import { FloatingAlert } from '@components/floatingAlert';
import { useNavigate } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  const [alertState, setAlertMessage] = useAlert();
  const [pendingApplications, setPendingApplications] = useState<
    PendingApplication[]
  >([]);
  const [recentOrders, setRecentOrders] = useState<OrderSummary[]>([]);
  const [recentDonations, setRecentDonations] = useState<Donation[]>([]);

  useEffect(() => {
    const fetchPendingApplications = async () => {
      try {
        const pendingApplications =
          await ApiClient.getRecentPendingApplications();
        setPendingApplications(pendingApplications);
      } catch {
        setAlertMessage('Error fetching pending applications');
      }
    };

    fetchPendingApplications();
  }, [setAlertMessage]);

  useEffect(() => {
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

    fetchRecentOrders();
  }, [setAlertMessage]);

  useEffect(() => {
    const fetchRecentDonations = async () => {
      try {
        const allDonations = await ApiClient.getAllDonations();
        const sortedDonations = allDonations.sort(
          (a: Donation, b: Donation) =>
            new Date(b.dateDonated).getTime() -
            new Date(a.dateDonated).getTime(),
        );
        const recentDonations = sortedDonations.slice(0, 2);
        setRecentDonations(recentDonations);
      } catch {
        setAlertMessage('Error fetching donations');
      }
    };

    fetchRecentDonations();
  }, [setAlertMessage]);

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
        Welcome, Admin!
      </Heading>

      <Text textStyle="p" color="gray.light" fontWeight={600} mb={4}>
        Pending Actions
      </Text>
      <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap={4} mb={16}>
        {pendingApplications.map((application) => (
          <DashboardCard
            type={DashboardCardType.ACTION}
            title={application.name}
            date={String(application.dateApplied)}
            linkText="View Application Details"
            badge={{
              label:
                application.type === 'pantry' ? 'Pantry' : 'Food Manufacturer',
              bg: 'neutral.100',
              color: 'neutral.600',
            }}
            onLinkClick={() => {
              navigate(
                application.type === 'pantry'
                  ? `/pantry-application-details/${application.id}`
                  : `/food-manufacturer-application-details/${application.id}`,
              );
            }}
          />
        ))}
      </Box>

      <Text textStyle="p" color="gray.light" fontWeight={600} mb={4}>
        Recent Orders
      </Text>
      <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap={4} mb={16}>
        {recentOrders.map((order) => (
          <DashboardCard
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

      <Text textStyle="p" color="gray.light" fontWeight={600} mb={4}>
        Recent Donations
      </Text>
      <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap={4} mb={16}>
        {recentDonations.map((donation) => (
          <DashboardCard
            type={DashboardCardType.RECENT_DONATION}
            title={`Donation #${donation.donationId}`}
            date={donation.dateDonated}
            subtitle={donation.foodManufacturer?.foodManufacturerName}
            linkText="View Donation Details"
            badge={DONATION_STATUS_BADGE[donation.status]}
            onLinkClick={() =>
              navigate(`/admin-donation?donationId=${donation.donationId}`)
            }
          />
        ))}
      </Box>
    </Box>
  );
};

export default AdminDashboard;
