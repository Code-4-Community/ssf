import ApiClient from '@api/apiClient';
import { Box, Heading, Text } from '@chakra-ui/react';
import DashboardCard, { DashboardCardType } from '@components/dashboardCard';
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
  Donation,
  DonationDetails,
  DonationReminderDto,
  FoodManufacturer,
  User,
} from '../types/types';

const FoodManufacturerDashboard: React.FC = () => {
  const navigate = useNavigate();

  const [errorAlertState, setErrorMessage] = useAlert();
  const [loading, setLoading] = useState(true);
  const [foodManufacturer, setFoodManufacturer] =
    useState<FoodManufacturer | null>(null);
  const [upcomingReminders, setUpcomingReminders] = useState<
    DonationReminderDto[]
  >([]);
  const [recentDonations, setRecentDonations] = useState<Donation[]>([]);
  const [stats, setStats] = useState<Record<string, string> | null>(null);

  useEffect(() => {
    const fetchFmData = async () => {
      let currentUser: User;
      try {
        currentUser = await ApiClient.getMe();
        const fmId = await ApiClient.getCurrentUserFoodManufacturerId();
        const fm = await ApiClient.getFoodManufacturer(fmId);
        setFoodManufacturer(fm);
      } catch {
        setErrorMessage('Error fetching dashboard data', AlertStatus.ERROR);
        return;
      } finally {
        setLoading(false);
      }

      try {
        const userStats = await ApiClient.getUserStats(currentUser.id);
        setStats(userStats);
      } catch {
        setErrorMessage(
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
        setErrorMessage(
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
        setErrorMessage('Error fetching recent donations.', AlertStatus.ERROR);
      }
    };
    fetchFmData();
  }, [setErrorMessage]);

  if (loading) return null;

  const isPageEmpty =
    upcomingReminders.length === 0 && recentDonations.length === 0;

  return (
    <Box p={12}>
      {errorAlertState && (
        <FloatingAlert
          key={errorAlertState.id}
          message={errorAlertState.message}
          status={errorAlertState.status}
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
