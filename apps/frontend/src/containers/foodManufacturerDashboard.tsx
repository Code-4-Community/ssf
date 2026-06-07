import React, { useEffect, useState } from 'react';
import { Box, Heading, Text } from '@chakra-ui/react';
import DashboardCard, { DashboardCardType } from '@components/dashboardCard';
import { Donation, DonationDetails, FoodManufacturer } from '../types/types';
import ApiClient from '@api/apiClient';
import { useAlert } from '../hooks/alert';
import { FloatingAlert } from '@components/floatingAlert';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../routes';
import SectionEmptyState from '@components/sectionEmptyState';

const FoodManufacturerDashboard: React.FC = () => {
  const navigate = useNavigate();

  const [errorAlertState, setErrorMessage] = useAlert();
  const [foodManufacturer, setFoodManufacturer] =
    useState<FoodManufacturer | null>(null);
  const [recentDonations, setRecentDonations] = useState<Donation[]>([]);

  useEffect(() => {
    const fetchFmData = async () => {
      let fmId: number;
      try {
        fmId = await ApiClient.getCurrentUserFoodManufacturerId();
        const fm = await ApiClient.getFoodManufacturer(fmId);
        setFoodManufacturer(fm);
      } catch {
        setErrorMessage('Error fetching your manufacturer profile.');
        return;
      }

      try {
        const donations = await ApiClient.getAllDonationsByFoodManufacturer(
          fmId,
        );
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
        setErrorMessage('Error fetching recent donations.');
      }
    };
    fetchFmData();
  }, [setErrorMessage]);

  if (!foodManufacturer) return null;

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
