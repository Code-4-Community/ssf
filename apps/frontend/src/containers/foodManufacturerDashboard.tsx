import ApiClient from '@api/apiClient';
import { Box, Heading, Text } from '@chakra-ui/react';
import DashboardCard, { DashboardCardType } from '@components/dashboardCard';
import { FloatingAlert } from '@components/floatingAlert';
import SectionEmptyState from '@components/sectionEmptyState';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAlert } from '../hooks/alert';
import { ROUTES } from '../routes';
import { Donation, DonationDetails, FoodManufacturer } from '../types/types';

const FoodManufacturerDashboard: React.FC = () => {
  const navigate = useNavigate();

  const [errorAlertState, setErrorMessage] = useAlert();
  const [loading, setLoading] = useState(true);
  const [foodManufacturer, setFoodManufacturer] =
    useState<FoodManufacturer | null>(null);
  const [recentDonations, setRecentDonations] = useState<Donation[]>([]);

  useEffect(() => {
    const fetchFmData = async () => {
      try {
        const fmId = await ApiClient.getCurrentUserFoodManufacturerId();
        const [fm, donations] = await Promise.all([
          ApiClient.getFoodManufacturer(fmId),
          ApiClient.getAllDonationsByFoodManufacturer(fmId),
        ]);

        setFoodManufacturer(fm);

        const sorted = donations
          .map((d: DonationDetails) => d.donation)
          .sort(
            (a: Donation, b: Donation) =>
              new Date(b.dateDonated).getTime() -
              new Date(a.dateDonated).getTime(),
          )
          .slice(0, 2);
        setRecentDonations(sorted);
      } catch {
        setErrorMessage('Error fetching dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchFmData();
  }, [setErrorMessage]);

  if (loading) return null;

  return (
    <Box p={12}>
      {errorAlertState && (
        <FloatingAlert
          key={errorAlertState.id}
          message={errorAlertState.message}
          status="error"
          timeout={6000}
        />
      )}
      <Heading textStyle="h1" color="gray.600" mb={6}>
        Welcome, {foodManufacturer?.foodManufacturerName}
      </Heading>

      <Text textStyle="p" color="gray.light" fontWeight={600} mb={4}>
        Recent Donations
      </Text>
      {recentDonations.length === 0 ? (
        <SectionEmptyState entity="recent donations" />
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
    </Box>
  );
};

export default FoodManufacturerDashboard;
