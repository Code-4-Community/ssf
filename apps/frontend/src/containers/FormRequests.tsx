import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Center,
  Table,
  Text,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  HStack,
} from '@chakra-ui/react';
import FoodRequestFormModal from '@components/forms/requestFormModalButton';
import DeliveryConfirmationModalButton from '@components/forms/deliveryConfirmationModalButton';
import { FoodRequest } from 'types/types';

const FormRequests: React.FC = () => {
  const [requests, setRequests] = useState<FoodRequest[]>([]);
  const [previousRequest, setPreviousRequest] = useState<
    FoodRequest | undefined
  >(undefined);
  const { pantryId } = useParams<{ pantryId: string }>();
  const [allConfirmed, setAllConfirmed] = useState(false);

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
        alert('Failed to fetch food requests ' + (await response.text()));
        return [];
      }
    } catch (error) {
      alert('Error fetching food requests ' + error);
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-CA');
  };

  const formatReceivedDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-CA');
  };

  useEffect(() => {
    setAllConfirmed(requests.every((request) => request.dateReceived !== null));
  }, [requests]);

  return (
    <Center flexDirection="column" p={4}>
      <HStack spacing={200}>
        <FoodRequestFormModal
          previousRequest={undefined}
          buttonText="Submit New Request"
          disabled={!allConfirmed}
        />

        {previousRequest && (
          <FoodRequestFormModal
            previousRequest={previousRequest}
            buttonText="Submit Previous Request"
            disabled={!allConfirmed}
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
                {request.status === 'fulfilled' ? (
                  <Text fontWeight="semibold" marginLeft="4">
                    Confirm Delivery
                  </Text>
                ) : (
                  <DeliveryConfirmationModalButton
                    requestId={request.requestId}
                  />
                )}
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Center>
  );
};

export default FormRequests;
