import React, { useEffect, useState } from 'react';
import { Box, Heading, Text } from '@chakra-ui/react';
import DashboardCard, { DashboardCardType } from '@components/dashboardCard';
import {
  AlertStatus,
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
import { ROUTES } from '../routes';
import SectionEmptyState from '@components/sectionEmptyState';
import PageEmptyState from '@components/pageEmptyState';
import { DashboardStats } from '@components/dashboardStats';

const FoodManufacturerDashboard: React.FC = () => {
  const navigate = useNavigate();

  const [alertState, setAlertMessage] = useAlert();
  const [foodManufacturer, setFoodManufacturer] =
    useState<FoodManufacturer | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [upcomingReminders, setUpcomingReminders] = useState<
    DonationReminderDto[]
  >([]);
  const [recentDonations, setRecentDonations] = useState<Donation[]>([]);
  const [stats, setStats] = useState<Record<string, string> | null>(null);

  useEffect(() => {
    const fetchFmData = async () => {
      let fmId: number;
      let currentUser: User;
      try {
        currentUser = await ApiClient.getMe();
        setUser(currentUser);

        fmId = await ApiClient.getCurrentUserFoodManufacturerId();
        const fm = await ApiClient.getFoodManufacturer(fmId);
        setFoodManufacturer(fm);
      } catch {
        setAlertMessage(
          'Error fetching your manufacturer profile.',
          AlertStatus.ERROR,
        );
        return;
      }

      try {
        const userStats = await ApiClient.getUserStats(currentUser.id);
        setStats(userStats);
      } catch {
        setAlertMessage(
          'Error fetching dashboard statistics',
          AlertStatus.ERROR,
        );
      }

      const [reminders, donations] = await Promise.allSettled([
        ApiClient.getNextTwoDonationReminders(),
        ApiClient.getAllDonationsByFoodManufacturer(),
      ]);

      if (reminders.status === 'fulfilled') {
        setUpcomingReminders(reminders.value);
      } else {
        setAlertMessage(
          'Error fetching upcoming donations.',
          AlertStatus.ERROR,
        );
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
        setAlertMessage('Error fetching recent donations.', AlertStatus.ERROR);
      }
    };
    fetchFmData();
  }, [setAlertMessage]);

  if (!foodManufacturer) return null;

  const isPageEmpty =
    upcomingReminders.length === 0 && recentDonations.length === 0;

  return (
    <Box p={12}>
      {alertState?.status === AlertStatus.ERROR && (
        <FloatingAlert
          key={alertState.id}
          message={alertState.message}
          status={alertState.status}
          timeout={6000}
        />
      )}
      <Heading textStyle="h1" color="gray.600" mb={6}>
        Welcome, {foodManufacturer?.foodManufacturerName}
      </Heading>

      {stats && <DashboardStats stats={stats} />}

      {isPageEmpty ? (
        <PageEmptyState
          entity="donations"
          primaryButtonText="Log New Donation"
          primaryButtonLink={ROUTES.FM_DONATION_MANAGEMENT}
          secondaryButtonText="View Donations"
          secondaryButtonLink={ROUTES.FM_DONATION_MANAGEMENT}
        />
      ) : (
        <>
          <Text textStyle="p" color="gray.light" fontWeight={600} mb={4}>
            Upcoming Donations
          </Text>
          {upcomingReminders.length === 0 ? (
            <Box mb={16}>
              <SectionEmptyState entity="upcoming donations" />
            </Box>
          ) : (
            <Box
              display="grid"
              gridTemplateColumns="repeat(2, 1fr)"
              gap={4}
              mb={16}
            >
              {upcomingReminders.map((reminder) => (
                <DashboardCard
                  key={`${reminder.donation.donationId}-${reminder.reminderDate}`}
                  type={DashboardCardType.UPCOMING_DONATION}
                  title={`Donation #${reminder.donation.donationId}`}
                  date={reminder.reminderDate}
                  subtitle={
                    reminder.donation.foodManufacturer?.foodManufacturerName
                  }
                  linkText="View Donation Requirements"
                  onLinkClick={() =>
                    navigate(
                      `${ROUTES.FM_DONATION_MANAGEMENT}?donationId=${reminder.donation.donationId}`,
                    )
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
                  onLinkClick={() =>
                    navigate(
                      `${ROUTES.FM_DONATION_MANAGEMENT}?donationId=${donation.donationId}`,
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

export default FoodManufacturerDashboard;
