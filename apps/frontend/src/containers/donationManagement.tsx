import React, { useEffect, useState } from 'react';
import {
  Center,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Box,
  Text,
} from '@chakra-ui/react';
import ApiClient from '@api/apiClient';
import NewDonationFormModalButton from '@components/forms/newDonationFormModalButton';

interface Donation {
  donationId: number;
  foodManufacturerId: number;
  dateDonated: string;
  status: string;
  totalItems: number;
  totalOz: number;
  totalEstimatedValue: number;
}

interface DonationItem {
  itemId: number;
  donationId: number;
  itemName: string;
  quantity: number;
  reservedQuantity: number;
  status: string;
  ozPerItem: number;
  estimatedValue: number;
  foodType: string;
}

const DonationManagement: React.FC = () => {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [expandedDonationIds, setExpandedDonationIds] = useState<number[]>([]);
  const [donationItems, setDonationItems] = useState<{
    [key: number]: DonationItem[];
  }>({});
  const [donationItemStock, setDonationItemStock] = useState<{
    [key: number]: number;
  }>({});

  const fetchDonations = async () => {
    try {
      const data = await ApiClient.get('/api/donations/get-all-donations');
      const sortedDonations = (data as Donation[]).sort((a, b) => {
        if (a.status === 'fulfilled' && b.status !== 'fulfilled') return 1;
        if (a.status !== 'fulfilled' && b.status === 'fulfilled') return -1;
        return 0;
      });
      setDonations(sortedDonations);
    } catch (error) {
      alert('Error fetching donations: ' + error);
    }
  };

  const fetchDonationItems = async (donationId: number) => {
    try {
      const items = await ApiClient.getDonationItemsByDonationId(donationId);
      setDonationItems((prev) => ({
        ...prev,
        [donationId]: items,
      }));

      items.forEach((item: DonationItem) => {
        setDonationItemStock((prev) => ({
          ...prev,
          [item.itemId]: item.quantity - item.reservedQuantity,
        }));
      });
    } catch (error) {
      alert('Error fetching donation items: ' + error);
    }
  };

  const toggleDropdown = (donationId: number) => {
    if (expandedDonationIds.includes(donationId)) {
      setExpandedDonationIds((prev) => prev.filter((id) => id !== donationId));
    } else {
      setExpandedDonationIds((prev) => [...prev, donationId]);
      if (!donationItems[donationId]) {
        fetchDonationItems(donationId);
      }
    }
  };

  const fulfillDonation = async (donationId: number) => {
    try {
      const response = await ApiClient.fulfillDonation(donationId);
      if (!response) {
        alert('Error fulfilling donation');
      }
      fetchDonations();
    } catch (error) {
      alert('Failed to fulfill donation: ' + error);
    }
  };

  // TEMPORARY USE FOR TESTING FUNCTIONALITY
  // CALLED WHEN A NEW DONATION ITEM HAS ITS STOCK DECREASE (WILL CHANGE THIS WHEN ASSIGNING DONATION ITEMS LATER)
  const updateDonationItem = async (item: DonationItem) => {
    try {
      const updatedItem = await ApiClient.updateDonationItemQuantity(
        item.itemId,
      );

      setDonationItemStock((prev) => ({
        ...prev,
        [item.itemId]: updatedItem.quantity - updatedItem.reservedQuantity,
      }));

      if (updatedItem.quantity - updatedItem.reservedQuantity === 0) {
        const items = await ApiClient.getDonationItemsByDonationId(
          item.donationId,
        );

        const fulfilledDonation = items.every(
          (donationItem) =>
            donationItem.quantity - donationItem.reservedQuantity === 0,
        );

        if (fulfilledDonation) {
          fulfillDonation(item.donationId);
        }
      }
    } catch (error) {
      alert('Failed to update donation item quantity: ' + error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-CA');
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  return (
    <Center flexDirection="column" p={4}>
      <NewDonationFormModalButton />
      <Table variant="simple" mt={6} width="80%">
        <Thead>
          <Tr>
            <Th>Donation Id</Th>
            <Th>Date Donated</Th>
            <Th>Status</Th>
            <Th>Remaining Stock</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {donations.map((donation) => (
            <Tr key={donation.donationId}>
              <Td>{donation.donationId}</Td>
              <Td>{formatDate(donation.dateDonated)}</Td>
              <Td>{donation.status}</Td>
              <Td>
                {expandedDonationIds.includes(donation.donationId) &&
                  donationItems[donation.donationId]?.map((item) => (
                    <Box key={item.itemId} borderBottom="1px solid" py={1}>
                      <Text>
                        <strong>Item Name:</strong> {item.itemName}
                      </Text>
                      <Text>
                        <strong>Food Type:</strong> {item.foodType}
                      </Text>
                      <Text>
                        <strong>Remaining Stock:</strong>{' '}
                        {donationItemStock[item.itemId]}
                      </Text>
                      <Button onClick={() => updateDonationItem(item)}>
                        Lower count
                      </Button>
                    </Box>
                  ))}
                <Text
                  cursor="pointer"
                  color="blue"
                  onClick={() => toggleDropdown(donation.donationId)}
                  mt={2}
                >
                  {expandedDonationIds.includes(donation.donationId)
                    ? 'Hide Information'
                    : 'Show Information'}
                </Text>
              </Td>
              <Td>
                {donation.status !== 'fulfilled' && (
                  <Button
                    colorScheme="green"
                    onClick={() => fulfillDonation(donation.donationId)}
                  >
                    Fulfill
                  </Button>
                )}
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Center>
  );
};

export default DonationManagement;
