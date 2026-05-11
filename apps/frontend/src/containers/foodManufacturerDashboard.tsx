import React, { useEffect, useState } from 'react';
import { Box, Heading, Text } from '@chakra-ui/react';
import DashboardCard, {
  DONATION_STATUS_BADGE,
  DashboardCardType,
} from '@components/dashboardCard';
import {
  Donation,
  DonationDetails,
  DonationReminderDto,
  FoodManufacturer,
  User,
} from '../types/types';
import ApiClient from '@api/apiClient';
import { useAlert } from '../hooks/alert';
import { FloatingAlert } from '@components/floatingAlert';
import { useNavigate } from 'react-router-dom';

const FoodManufacturerDashboard: React.FC = () => {
  const navigate = useNavigate();

  const [alertState, setAlertMessage] = useAlert();
  const [foodManufacturer, setFoodManufacturer] =
    useState<FoodManufacturer | null>(null);
  const [upcomingReminders, setUpcomingReminders] = useState<
    DonationReminderDto[]
  >([]);
  const [recentDonations, setRecentDonations] = useState<Donation[]>([]);

  useEffect(() => {
    const fetchFmData = async () => {
      let fmId: number;
      try {
        fmId = await ApiClient.getCurrentUserFoodManufacturerId();
        const fm = await ApiClient.getFoodManufacturer(fmId);
        setFoodManufacturer(fm);
      } catch {
        setAlertMessage('Error fetching your manufacturer profile.');
        return;
      }

      const [reminders, donations] = await Promise.allSettled([
        ApiClient.getNextTwoDonationReminders(fmId),
        ApiClient.getAllDonationsByFoodManufacturer(fmId),
      ]);

      if (reminders.status === 'fulfilled') {
        setUpcomingReminders(reminders.value);
      } else {
        setAlertMessage('Error fetching upcoming donations.');
      }

      if (donations.status === 'fulfilled') {
        const sorted = donations.value
          .map((d: DonationDetails) => d.donation)
          .sort(
            (a: Donation, b: Donation) =>
              new Date(b.dateDonated).getTime() -
              new Date(a.dateDonated).getTime(),
          )
          .slice(0, 2);
        setRecentDonations(sorted);
      } else {
        setAlertMessage('Error fetching recent donations.');
      }
    };
    fetchFmData();
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
        Welcome, {foodManufacturer?.foodManufacturerName}
      </Heading>

      <Text textStyle="p" color="gray.light" fontWeight={600} mb={4}>
        Upcoming Donations
      </Text>
      <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap={4} mb={16}>
        {upcomingReminders.map((reminder) => (
          <DashboardCard
            key={reminder.donation.donationId}
            type={DashboardCardType.UPCOMING_DONATION}
            title={`Donation #${reminder.donation.donationId}`}
            date={reminder.reminderDate}
            subtitle={reminder.donation.foodManufacturer?.foodManufacturerName}
            badge={DONATION_STATUS_BADGE[reminder.donation.status]}
            linkText="View Donation Requirements"
            onLinkClick={() =>
              navigate(
                `/fm-donation-management?donationId=${reminder.donation.donationId}`,
              )
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
            key={donation.donationId}
            type={DashboardCardType.RECENT_DONATION}
            title={`Donation #${donation.donationId}`}
            date={donation.dateDonated}
            subtitle={donation.foodManufacturer?.foodManufacturerName}
            badge={DONATION_STATUS_BADGE[donation.status]}
            linkText="View Donation Details"
            onLinkClick={() =>
              navigate(
                `/fm-donation-management?donationId=${donation.donationId}`,
              )
            }
          />
        ))}
      </Box>
    </Box>
  );
};

export default FoodManufacturerDashboard;
