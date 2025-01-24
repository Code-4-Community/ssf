import React, { useEffect, useState } from 'react';
import { Center, Table, Thead, Tbody, Tr, Th, Td } from '@chakra-ui/react';
import FoodRequestFormModal from '@components/forms/requestFormModalButton';
import DeliveryConfirmationModalButton from '@components/forms/deliveryConfirmationModalButton';

interface FoodRequest {
  requestId: number;
  requestedAt: string;
  status: string;
  fulfilledBy: string | null;
  dateReceived: string | null;
}

const FormRequests: React.FC = () => {
  const [requests, setRequests] = useState<FoodRequest[]>([]);

  const getAllPantryRequests = async (
    pantryId: number,
  ): Promise<FoodRequest[]> => {
    try {
      const response = await fetch(`/api/requests/${pantryId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        return await response.json();
      } else {
        console.error('Failed to fetch food requests', await response.text());
        return [];
      }
    } catch (error) {
      console.error('Error fetching food requests', error);
      return [];
    }
  };

  useEffect(() => {
    const fetchRequests = async () => {
      const data = await getAllPantryRequests(1); // Pantry ID hardcoded to 1 for now
      console.log(data);
      setRequests(data);
    };

    fetchRequests();
  }, []);

  return (
    <Center flexDirection="column" p={4}>
      {/* Food Request Form Modal at the top */}
      <FoodRequestFormModal />

      {/* Table displaying orders */}
      <Table variant="simple" mt={6} width="80%">
        <Thead>
          <Tr>
            <Th>Request Id</Th>
            <Th>Date Requested</Th>
            <Th>Status</Th>
            <Th>Fulfilled By</Th>
            <Th>Expected Delivery Date</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {requests.map((request) => (
            <Tr key={request.requestId}>
              <Td>{request.requestId}</Td>
              <Td>{request.requestedAt}</Td>
              <Td>{request.status}</Td>
              <Td>{request.fulfilledBy}</Td>
              <Td>{request.dateReceived}</Td>
              <Td>
                <DeliveryConfirmationModalButton />
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Center>
  );
};

export default FormRequests;
