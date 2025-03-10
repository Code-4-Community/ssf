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
  Select,
} from '@chakra-ui/react';
import ApiClient from '@api/apiClient';
import FoodRequestFormModalButton from '@components/forms/requestFormModalButton';
import DeliveryConfirmationModalButton from '@components/forms/deliveryConfirmationModalButton';
import { FoodRequest } from 'types/types';
import OrderInformationModalButton from '@components/forms/orderInformationModalButton';

const FormRequests: React.FC = () => {
  const [requests, setRequests] = useState<FoodRequest[]>([]);
  // Temporary comment
  const [previousRequest, setPreviousRequest] = useState<
    FoodRequest | undefined
  >(undefined);
  const [sortBy, setSortBy] = useState<string>('mostRecent');
  const { pantryId } = useParams<{ pantryId: string }>();

  useEffect(() => {
    const fetchRequests = async () => {
      if (pantryId) {
        try {
          const data = await ApiClient.getAllPantryRequests(
            parseInt(pantryId, 10),
          );
          setRequests(data);

          if (data.length > 0) {
            setPreviousRequest(
              data.reduce((prev, current) =>
                prev.requestId > current.requestId ? prev : current,
              ),
            );
          }
        } catch (error) {
          alert('Error fetching requests: ' + error);
        }
      }
    };

    fetchRequests();
  }, [pantryId]);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-CA');
  const formatReceivedDate = (dateString: string | null) =>
    dateString ? new Date(dateString).toLocaleDateString('en-CA') : 'N/A';

  const sortedRequests = [...requests].sort((a, b) => {
    if (sortBy === 'mostRecent')
      return (
        new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
      );
    if (sortBy === 'oldest')
      return (
        new Date(a.requestedAt).getTime() - new Date(b.requestedAt).getTime()
      );
    if (sortBy === 'status') return b.status.localeCompare(a.status);
    if (sortBy === 'confirmed')
      return (
        new Date(b.dateReceived || 0).getTime() -
        new Date(a.dateReceived || 0).getTime()
      );
    return 0;
  });

  return (
    <Center flexDirection="column" p={4}>
      <HStack spacing={200}>
        <FoodRequestFormModalButton
          readOnly={false}
          buttonText="Submit New Request"
        />

        {previousRequest && (
          <FoodRequestFormModalButton
            previousRequest={previousRequest}
            readOnly={false}
            buttonText="Submit Previous Request"
          />
        )}
      </HStack>

      <Select
        mt={4}
        width="50%"
        onChange={(e) => setSortBy(e.target.value)}
        value={sortBy}
      >
        <option value="mostRecent">Date Requested (Recent)</option>
        <option value="oldest">Date Requested (Oldest)</option>
        <option value="status">Status</option>
        <option value="confirmed">Order Confirmation (Date Fulfilled)</option>
      </Select>

      <Table variant="simple" mt={6} width="80%">
        <Thead>
          <Tr>
            <Th>Request Id</Th>
            <Th>Order Id</Th>
            <Th>Date Requested</Th>
            <Th>Status</Th>
            <Th>Fulfilled By</Th>
            <Th>Date Fulfilled</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {sortedRequests.map((request) => (
            <Tr key={request.requestId}>
              <Td>
                <FoodRequestFormModalButton
                  previousRequest={request}
                  readOnly={true}
                  buttonText={request.requestId.toString()}
                />
              </Td>
              <Td>
                {request.orderId ? (
                  <OrderInformationModalButton orderId={request.orderId} />
                ) : (
                  'N/A'
                )}
              </Td>
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
