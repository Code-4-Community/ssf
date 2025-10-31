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
  Select,
  Button,
  HStack,
  useDisclosure,
} from '@chakra-ui/react';
import FoodRequestFormModal from '@components/forms/requestFormModal';
import DeliveryConfirmationModal from '@components/forms/deliveryConfirmationModal';
import OrderInformationModal from '@components/forms/orderInformationModal';
import { FoodRequest } from 'types/types';
import { formatDate, formatReceivedDate } from '@utils/utils';
import ApiClient from '@api/apiClient';

const FormRequests: React.FC = () => {
  const newRequestDisclosure = useDisclosure();
  const previousRequestDisclosure = useDisclosure();

  const [requests, setRequests] = useState<FoodRequest[]>([]);
  const [previousRequest, setPreviousRequest] = useState<
    FoodRequest | undefined
  >(undefined);
  const [sortBy, setSortBy] = useState<'mostRecent' | 'oldest' | 'confirmed'>(
    'mostRecent',
  );
  const { pantryId } = useParams<{ pantryId: string }>();
  const [allConfirmed, setAllConfirmed] = useState(false);
  const [openDeliveryRequestId, setOpenDeliveryRequestId] = useState<
    number | null
  >(null);
  const [openReadOnlyRequest, setOpenReadOnlyRequest] =
    useState<FoodRequest | null>(null);
  const [openOrderId, setOpenOrderId] = useState<number | null>(null);

  useEffect(() => {
    const fetchRequests = async () => {
      if (pantryId) {
        try {
          const data = await ApiClient.getPantryRequests(
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

  useEffect(() => {
    setAllConfirmed(requests.every((request) => request.dateReceived !== null));
  }, [requests]);

  const sortedRequests = [...requests].sort((a, b) => {
    if (sortBy === 'mostRecent')
      return (
        new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
      );
    if (sortBy === 'oldest')
      return (
        new Date(a.requestedAt).getTime() - new Date(b.requestedAt).getTime()
      );
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
        <Button
          onClick={newRequestDisclosure.onOpen}
          isDisabled={!allConfirmed}
        >
          Submit New Request
        </Button>
        <FoodRequestFormModal
          previousRequest={undefined}
          isOpen={newRequestDisclosure.isOpen}
          onClose={newRequestDisclosure.onClose}
        />
        {previousRequest && (
          <>
            <Button
              onClick={previousRequestDisclosure.onOpen}
              isDisabled={!allConfirmed}
            >
              Submit Previous Request
            </Button>
            <FoodRequestFormModal
              previousRequest={previousRequest}
              readOnly={false}
              isOpen={previousRequestDisclosure.isOpen}
              onClose={previousRequestDisclosure.onClose}
            />
          </>
        )}
      </HStack>

      <Select
        mt={4}
        width="50%"
        onChange={(e) =>
          setSortBy(e.target.value as 'mostRecent' | 'oldest' | 'confirmed')
        }
        value={sortBy}
      >
        <option value="mostRecent">Date Requested (Recent)</option>
        <option value="oldest">Date Requested (Oldest)</option>
        <option value="confirmed">Order Confirmation (Date Fulfilled)</option>
      </Select>

      <Table variant="simple" mt={6} width="80%">
        <Thead>
          <Tr>
            <Th>Request Id</Th>
            <Th>Order Id</Th>
            <Th>Date Requested</Th>
            <Th>Status</Th>
            <Th>Shipped By</Th>
            <Th>Date Fulfilled</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {sortedRequests.map((request) => (
            <Tr key={request.requestId}>
              <Td>
                <Button onClick={() => setOpenReadOnlyRequest(request)}>
                  {request.requestId}
                </Button>
              </Td>
              <Td>
                {request.order?.orderId ? (
                  <Button
                    onClick={() =>
                      setOpenOrderId(request.order?.orderId ?? null)
                    }
                  >
                    {request.order?.orderId}
                  </Button>
                ) : (
                  'N/A'
                )}
              </Td>
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
                  <Button
                    onClick={() => setOpenDeliveryRequestId(request.requestId)}
                  >
                    Confirm Delivery
                  </Button>
                )}
              </Td>
            </Tr>
          ))}
          {openReadOnlyRequest && (
            <FoodRequestFormModal
              previousRequest={openReadOnlyRequest}
              readOnly={true}
              isOpen={openReadOnlyRequest !== null}
              onClose={() => setOpenReadOnlyRequest(null)}
            />
          )}
          {openOrderId && (
            <OrderInformationModal
              orderId={openOrderId}
              isOpen={openOrderId !== null}
              onClose={() => setOpenOrderId(null)}
            />
          )}
          {openDeliveryRequestId && (
            <DeliveryConfirmationModal
              requestId={openDeliveryRequestId}
              isOpen={openDeliveryRequestId !== null}
              onClose={() => setOpenDeliveryRequestId(null)}
            />
          )}
        </Tbody>
      </Table>
    </Center>
  );
};

export default FormRequests;
