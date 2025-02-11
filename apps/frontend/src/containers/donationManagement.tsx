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
} from '@chakra-ui/react';

interface Donation {
  donationId: number;
  foodManufacturerId: number;
  dateDonated: string;
  status: string;
}

const DonationManagement: React.FC = () => {
  const [donations, setDonations] = useState<Donation[]>([]);

  const getAllDonations = async (): Promise<Donation[]> => {
    try {
      const response = await fetch(`/api/donations/get-all-donations`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        return await response.json();
      } else {
        alert('Failed to fetch donations: ' + (await response.text()));
        return [];
      }
    } catch (error) {
      alert('Error fetching donations: ' + error);
      return [];
    }
  };

  useEffect(() => {
    const fetchDonations = async () => {
      const data = await getAllDonations();
      setDonations(data);
    };

    fetchDonations();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-CA');
  };

  return (
    <Center flexDirection="column" p={4}>
      <Table variant="simple" mt={6} width="80%">
        <Thead>
          <Tr>
            <Th>Donation Id</Th>
            <Th>Date Donated</Th>
            <Th>Status</Th>
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
                <Button colorScheme="green">Process</Button>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Center>
  );
};

export default DonationManagement;
