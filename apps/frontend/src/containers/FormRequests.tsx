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
  Button,
  HStack,
  useDisclosure,
} from '@chakra-ui/react';
import FoodRequestFormModal from '@components/forms/requestFormModalButton';
import DeliveryConfirmationModalButton from '@components/forms/deliveryConfirmationModalButton';
import { FoodRequest } from 'types/types';
import { formatDate, formatReceivedDate } from '@utils/utils';
import ApiClient from '@api/apiClient';
import { all } from 'axios';

const FormRequests: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [requests, setRequests] = useState<FoodRequest[]>([]);
  const [previousRequest, setPreviousRequest] = useState<
    FoodRequest | undefined
  >(undefined);
  const { pantryId } = useParams<{ pantryId: string }>();
  const [allConfirmed, setAllConfirmed] = useState(false);

  useEffect(() => {
    const fetchRequests = async () => {
      if (pantryId) {
        const data = await ApiClient.getPantryRequests(parseInt(pantryId, 10));
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

  useEffect(() => {
    setAllConfirmed(requests.every((request) => request.dateReceived !== null));
  }, [requests]);

  return (
    <Center flexDirection="column" p={4}>
      <HStack spacing={200}>
        <Button onClick={onOpen} isDisabled={!allConfirmed}>
          Submit New Request
        </Button>
        <FoodRequestFormModal
          previousRequest={undefined}
          isOpen={isOpen}
          onClose={onClose}
        />

        {previousRequest && (
          <>
            <Button onClick={onOpen} isDisabled={!allConfirmed}>
              Submit Previous Request
            </Button>
            <FoodRequestFormModal
              previousRequest={previousRequest}
              isOpen={isOpen}
              onClose={onClose}
            />
          </>
        )}
      </HStack>

      <Table variant="simple" mt={6} width="80%">
        <Thead>
          <Tr>
            <Th>Request Id</Th>
            <Th>Date Requested</Th>
            <Th>Status</Th>
            <Th>Shipped By</Th>
            <Th>Delivery Date</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {requests.map((request) => (
            <Tr key={request.requestId}>
              <Td>{request.requestId}</Td>
              <Td>{formatDate(request.requestedAt)}</Td>
              <Td>{request.order?.status ?? 'pending'}</Td>
              <Td>
                {request.order?.status === 'pending'
                  ? 'N/A'
                  : request.order?.shippedBy ?? 'N/A'}
              </Td>
              <Td>{formatReceivedDate(request.dateReceived)}</Td>
              <Td>
                {!request.order || request.order?.status === 'pending' ? (
                  <Text>Awaiting Order Assignment</Text>
                ) : request.order?.status === 'delivered' ? (
                  <Text>Food Request is Already Delivered</Text>
                ) : (
                  <>
                    <Button onClick={onOpen}>Confirm Delivery</Button>
                    <DeliveryConfirmationModalButton
                      requestId={request.requestId}
                      isOpen={isOpen}
                      onClose={onClose}
                    />
                  </>
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
