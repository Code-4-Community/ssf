import React from 'react';
import { Box, Heading, Text } from '@chakra-ui/react';
import DashboardCard, {
  ORDER_STATUS_BADGE,
  DONATION_STATUS_BADGE,
} from '@components/forms/dashboardCard';
import { DashboardCardType, OrderStatus, DonationStatus } from '../types/types';

const AdminDashboard: React.FC = () => {
  return (
    <Box p={12}>
      <Heading textStyle="h1" color="gray.600" mb={6}>
        Welcome, Admin!
      </Heading>

      <Text textStyle="p" color="gray.light" fontWeight={600} mb={4}>
        Pending Actions
      </Text>
      <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap={4} mb={16}>
        <DashboardCard
          type={DashboardCardType.Action}
          title="Brooklyn Food Pantry"
          date="2025-04-10"
          linkText="View Application Details"
          badge={{ label: 'Pantry' }}
        />
        <DashboardCard
          type={DashboardCardType.Action}
          title="Sunbutter"
          date="2025-04-15"
          linkText="View Application Details"
          badge={{ label: 'Food Manufacturer' }}
        />
        <DashboardCard
          type={DashboardCardType.Action}
          title="Brooklyn Food Pantry"
          date="2025-04-15"
          linkText="View Application Details"
          badge={{ label: 'Pantry' }}
        />
      </Box>

      <Text textStyle="p" color="gray.light" fontWeight={600} mb={4}>
        Recent Orders
      </Text>
      <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap={4} mb={16}>
        <DashboardCard
          type={DashboardCardType.Order}
          title="Order #20"
          date="2025-04-01"
          subtitle="Boston Food Pantry"
          linkText="View Order Details"
          badge={ORDER_STATUS_BADGE[OrderStatus.DELIVERED]}
          assignee={{ id: 2, firstName: 'Laney', lastName: 'Ridge' }}
        />
        <DashboardCard
          type={DashboardCardType.Order}
          title="Order #19"
          date="2025-04-20"
          subtitle="New York Food Pantry"
          linkText="View Order Details"
          badge={ORDER_STATUS_BADGE[OrderStatus.SHIPPED]}
          assignee={{ id: 2, firstName: 'Macy', lastName: 'Jiang' }}
        />
      </Box>

      <Text textStyle="p" color="gray.light" fontWeight={600} mb={4}>
        Recent Donations
      </Text>
      <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap={4} mb={16}>
        <DashboardCard
          type={DashboardCardType.Donation}
          title="Donation #20"
          date="2025-04-01"
          subtitle="Eastside Food Bank"
          linkText="View Donation Details"
          badge={DONATION_STATUS_BADGE[DonationStatus.FULFILLED]}
        />
        <DashboardCard
          type={DashboardCardType.Donation}
          title="Donation #19"
          date="2025-04-20"
          subtitle="Sainsbury's"
          linkText="View Donation Details"
          badge={DONATION_STATUS_BADGE[DonationStatus.AVAILABLE]}
        />
      </Box>

      <Text textStyle="p" color="gray.light" fontWeight={600} mb={4}>
        Upcoming Donations
      </Text>
      <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap={4} mb={16}>
        <DashboardCard
          type={DashboardCardType.Donation}
          title="Donation #1042"
          dateLabel="Scheduled"
          date="2025-04-10"
          linkText="View Donation Requirements"
        />
      </Box>

      <Text textStyle="p" color="gray.light" fontWeight={600} mb={4}>
        Recent Food Requests
      </Text>
      <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap={4} mb={16}>
        <DashboardCard
          type={DashboardCardType.FoodRequest}
          title="Order #20"
          date="2025-04-01"
          subtitle="Eastside Food Bank"
          linkText="Fulfill Request"
        />
        <DashboardCard
          type={DashboardCardType.FoodRequest}
          title="Action Required: Confirm Delivery"
          date="2025-04-20"
          subtitle="Westside Community Pantry"
          linkText="Fulfill Request"
        />
      </Box>
    </Box>
  );
};

export default AdminDashboard;
