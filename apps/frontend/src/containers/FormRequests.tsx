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
  useDisclosure,
} from '@chakra-ui/react';
import ApiClient from '@api/apiClient';
import FoodRequestFormModal from '@components/forms/requestFormModalButton';
import DeliveryConfirmationModalButton from '@components/forms/deliveryConfirmationModalButton';
import { FoodRequest } from 'types/types';

const FormRequests: React.FC = () => {
  const [requests, setRequests] = useState<FoodRequest[]>([]);
  const [previousRequest, setPreviousRequest] = useState<
    FoodRequest | undefined
  >(undefined);
  const [selectedRequest, setSelectedRequest] = useState<FoodRequest | null>(
    null,
  ); // Tracking selected request
  const [sortBy, setSortBy] = useState<string>('mostRecent');
  const [orderMapping, setOrderMapping] = useState<
    Record<number, number | null>
  >({});
  const { pantryId } = useParams<{ pantryId: string }>();

  const { isOpen, onOpen, onClose } = useDisclosure();

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

          const orderPromises = data.map(async (request) => {
            try {
              const order = await ApiClient.getOrderByRequest(
                request.requestId,
              );
              return {
                requestId: request.requestId,
                orderId: order?.orderId ?? null,
              };
            } catch (error) {
              console.error(
                `Error fetching order for requestId ${request.requestId}:`,
                error,
              );
              return { requestId: request.requestId, orderId: null };
            }
          });

          const orderResults = await Promise.all(orderPromises);
          const mapping: Record<number, number | null> = {};
          orderResults.forEach(({ requestId, orderId }) => {
            mapping[requestId] = orderId;
          });
          setOrderMapping(mapping);
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
        {/* Submit New Request */}
        <FoodRequestFormModal
          previousRequest={undefined}
          buttonText="Submit New Request"
        />

        {/* Submit Previous Request */}
        {previousRequest && (
          <FoodRequestFormModal
            previousRequest={previousRequest}
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
              <Td
                cursor="pointer"
                color="blue.500"
                _hover={{ textDecoration: 'underline' }}
                onClick={() => {
                  setSelectedRequest(request); // Set selected request on click
                  onOpen(); // Open the modal
                }}
              >
                {request.requestId}
              </Td>
              <Td>{orderMapping[request.requestId] ?? 'N/A'}</Td>
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

      {selectedRequest && (
        <FoodRequestFormModal
          previousRequest={selectedRequest}
          buttonText=""
          readOnly={true}
          externalIsOpen={isOpen}
          externalOnClose={onClose}
        />
      )}
    </Center>
  );
};

export default FormRequests;
