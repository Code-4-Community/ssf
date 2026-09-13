import ApiClient from '@api/apiClient';
import { Box, Button, Heading, Text } from '@chakra-ui/react';
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
  ManufacturerSummary,
  User,
} from '../types/types';

const formatManufacturerNames = (names: string[]): string => {
  if (names.length <= 1) return names[0] ?? '';
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]}`;
};

const FoodManufacturerDashboard: React.FC = () => {
  const navigate = useNavigate();

  const [errorAlertState, setErrorMessage] = useAlert();
  const [loading, setLoading] = useState(true);
  const [foodManufacturers, setFoodManufacturers] = useState<
    ManufacturerSummary[]
  >([]);
  const [upcomingReminders, setUpcomingReminders] = useState<
    DonationReminderDto[]
  >([]);
  const [recentDonations, setRecentDonations] = useState<Donation[]>([]);
  const [donationsFetchFailed, setDonationsFetchFailed] = useState(false);
  const [remindersFetchFailed, setRemindersFetchFailed] = useState(false);
  const [stats, setStats] = useState<Record<string, string> | null>(null);
  const [statsFetchFailed, setStatsFetchFailed] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const fetchUserAndManufacturers =
    React.useCallback(async (): Promise<User | null> => {
      try {
        const user = await ApiClient.getMe();
        setCurrentUser(user);
        const fms = await ApiClient.getMyFoodManufacturers();
        setFoodManufacturers(fms);
        return user;
      } catch {
        setErrorMessage('Error fetching dashboard data', AlertStatus.ERROR);
        return null;
      }
    }, [setErrorMessage]);

  const fetchStats = React.useCallback(
    async (userId: number) => {
      setStatsFetchFailed(false);
      try {
        const userStats = await ApiClient.getUserStats(userId);
        setStats(userStats);
      } catch {
        setStatsFetchFailed(true);
        setErrorMessage(
          'Error fetching dashboard statistics',
          AlertStatus.ERROR,
        );
      }
    },
    [setErrorMessage],
  );

  const fetchReminders = React.useCallback(async () => {
    setRemindersFetchFailed(false);
    try {
      const reminders = await ApiClient.getNextTwoDonationReminders();
      setUpcomingReminders(reminders);
    } catch {
      setRemindersFetchFailed(true);
      setErrorMessage('Error fetching upcoming donations.', AlertStatus.ERROR);
    }
  }, [setErrorMessage]);

  const fetchRecentDonations = React.useCallback(async () => {
    setDonationsFetchFailed(false);
    try {
      const data = await ApiClient.getAllDonationsByFoodManufacturer();
      const sorted = data
        .map((d: DonationDetails) => d.donation)
        .sort(
          (a: Donation, b: Donation) =>
            new Date(b.dateDonated).getTime() -
            new Date(a.dateDonated).getTime(),
        )
        .slice(0, 2);
      setRecentDonations(sorted);
    } catch {
      setDonationsFetchFailed(true);
      setErrorMessage('Error fetching recent donations.', AlertStatus.ERROR);
    }
  }, [setErrorMessage]);

  useEffect(() => {
    const load = async () => {
      const user = await fetchUserAndManufacturers();
      setLoading(false);
      if (!user) return;
      await Promise.allSettled([
        fetchStats(user.id),
        fetchReminders(),
        fetchRecentDonations(),
      ]);
    };
    load();
  }, [
    fetchUserAndManufacturers,
    fetchStats,
    fetchReminders,
    fetchRecentDonations,
  ]);

  if (loading) return null;

  const isPageEmpty =
    upcomingReminders.length === 0 &&
    !remindersFetchFailed &&
    recentDonations.length === 0 &&
    !donationsFetchFailed;

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
        Welcome,{' '}
        {formatManufacturerNames(
          foodManufacturers.map((fm) => fm.foodManufacturerName),
        )}
      </Heading>

      {statsFetchFailed ? (
        <Box mb={16}>
          <SectionEmptyState
            entity="dashboard statistics"
            subtitle="We couldn't load your dashboard statistics. Please try again."
          />
          <Box display="flex" justifyContent="center">
            <Button
              onClick={() => currentUser && fetchStats(currentUser.id)}
              variant="outline"
            >
              Retry
            </Button>
          </Box>
        </Box>
      ) : (
        stats && <DashboardStats stats={stats} />
      )}

      {isPageEmpty ? (
        <PageEmptyState
          entity="donations"
          primaryButtonText="Log New Donation"
          primaryButtonLink={`${ROUTES.FM_DONATION_MANAGEMENT}?logDonation=true`}
          secondaryButtonText="View Donations"
          secondaryButtonLink={ROUTES.FM_DONATION_MANAGEMENT}
        />
      ) : (
        <>
          <Text textStyle="p" color="gray.light" fontWeight={600} mb={4}>
            Upcoming Email Reminders for Donations
          </Text>
          {remindersFetchFailed ? (
            <Box mb={16}>
              <SectionEmptyState
                entity="upcoming donations"
                subtitle="We couldn't load your upcoming reminders. Please try again."
              />
              <Box display="flex" justifyContent="center">
                <Button onClick={fetchReminders} variant="outline">
                  Retry
                </Button>
              </Box>
            </Box>
          ) : upcomingReminders.length === 0 ? (
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
                  linkText="Submit Donation"
                  onLinkClick={() =>
                    navigate(
                      `${ROUTES.FM_DONATION_MANAGEMENT}?resubmitDonationId=${reminder.donation.donationId}`,
                    )
                  }
                />
              ))}
            </Box>
          )}

          <Text textStyle="p" color="gray.light" fontWeight={600} mb={4}>
            Recent Donations
          </Text>
          {donationsFetchFailed ? (
            <Box mb={16}>
              <SectionEmptyState
                entity="recent donations"
                subtitle="We couldn't load your recent donations. Please try again."
              />
              <Box display="flex" justifyContent="center">
                <Button onClick={fetchRecentDonations} variant="outline">
                  Retry
                </Button>
              </Box>
            </Box>
          ) : recentDonations.length === 0 ? (
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
