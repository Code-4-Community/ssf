import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Center,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  HStack,
} from '@chakra-ui/react';
import FoodRequestFormModal from '@components/forms/requestFormModalButton';
import DeliveryConfirmationModalButton from '@components/forms/deliveryConfirmationModalButton';

interface FoodRequest {
  requestId: number;
  requestedAt: string;
  status: string;
  fulfilledBy: string | null;
  dateReceived: string | null;
  requestedSize: string;
  requestedItems: string[];
  additionalInformation: string;
}

const FormRequests: React.FC = () => {
  const [requests, setRequests] = useState<FoodRequest[]>([]);
  const [previousRequest, setPreviousRequest] = useState<
    FoodRequest | undefined
  >(undefined);
  const { pantryId } = useParams<{ pantryId: string }>();

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
      if (pantryId) {
        const data = await getAllPantryRequests(parseInt(pantryId, 10));
        setRequests(data);

        if (data.length > 0) {
          const mostRecentRequest = data.reduce((prev, current) =>
            prev.requestId > current.requestId ? prev : current,
          );
          setPreviousRequest(mostRecentRequest);
        }
      }
    };

    fetchRequests();
  }, [pantryId]);
  console.log('Current previous request: ', previousRequest);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-CA');
  };

  const formatReceivedDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-CA');
  };

  return (
    <Center flexDirection="column" p={4}>
      <HStack spacing={200}>
        <FoodRequestFormModal
          previousRequest={undefined}
          buttonText="Submit New Request"
        />

        {previousRequest && (
          <FoodRequestFormModal
            previousRequest={previousRequest}
            buttonText="Submit Previous Request"
          />
        )}
      </HStack>

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
              <Td>{formatDate(request.requestedAt)}</Td>
              <Td>{request.status}</Td>
              <Td>{request.fulfilledBy}</Td>
              <Td>{formatReceivedDate(request.dateReceived)}</Td>
              <Td>
                <DeliveryConfirmationModalButton
                  requestId={request.requestId}
                />
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Center>
  );
};

export default FormRequests;
