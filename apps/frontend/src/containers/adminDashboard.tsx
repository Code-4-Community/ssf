import React from 'react';
import { Box, Heading, Text } from '@chakra-ui/react';
import DashboardCard from '@components/forms/dashboardCard';
import { DashboardCardType } from '../types/types';

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
          dateLabel="Applied"
          date="2025-04-10"
          linkText="View Application Details"
          onLinkClick={undefined}
          badge={{ label: 'Pantry' }}
        />

        <DashboardCard
          type={DashboardCardType.Action}
          title="Sunbutter"
          dateLabel="Applied"
          date="2025-04-15"
          linkText="View Application Details"
          onLinkClick={undefined}
          badge={{ label: 'Food Manufacturer' }}
        />
        <DashboardCard
          type={DashboardCardType.Action}
          title="Brooklyn Food Pantry"
          dateLabel="Applied"
          date="2025-04-15"
          linkText="View Application Details"
          onLinkClick={undefined}
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
          dateLabel="Requested"
          date="2025-04-01"
          subtitle="Boston Food Pantry"
          linkText="View Order Details"
          onLinkClick={undefined}
          badge={{ label: 'Received', bg: 'blue.100', color: 'blue.ssf' }}
          assignee={{ id: 2, firstName: 'Laney', lastName: 'Ridge' }}
        />

        <DashboardCard
          type={DashboardCardType.Order}
          title="Order #19"
          dateLabel="Requested"
          date="2025-04-20"
          subtitle="New York Food Pantry"
          linkText="View Order Details"
          onLinkClick={undefined}
          badge={{
            label: 'In Progress',
            bg: 'yellow.100',
            color: 'yellow.ssf',
          }}
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
          dateLabel="Donated"
          date="2025-04-01"
          subtitle="Eastside Food Bank"
          linkText="View Donation Details"
          onLinkClick={undefined}
        />

        <DashboardCard
          type={DashboardCardType.Donation}
          title="Donation #19"
          dateLabel="Donated"
          date="2025-04-20"
          subtitle="Sainsbury's"
          linkText="View Donation Details"
          onLinkClick={undefined}
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
          onLinkClick={undefined}
        />
      </Box>

      <Text textStyle="p" color="gray.light" fontWeight={600} mb={4}>
        Recent Food Requests
      </Text>
      <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap={4} mb={16}>
        <DashboardCard
          type={DashboardCardType.FoodRequest}
          title="Order #20"
          dateLabel="Requested"
          date="2025-04-01"
          subtitle="Eastside Food Bank"
          linkText="Fulfill Request"
          onLinkClick={undefined}
        />

        <DashboardCard
          type={DashboardCardType.FoodRequest}
          title="Action Required: Confirm Delivery"
          dateLabel="Due:"
          date="2025-04-20"
          subtitle="Westside Community Pantry"
          linkText="Fulfill Request"
          onLinkClick={undefined}
        />
      </Box>
    </Box>
  );
};

export default AdminDashboard;
