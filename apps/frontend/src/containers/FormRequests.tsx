import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Center,
  Table,
  Text,
  Button,
  HStack,
  useDisclosure,
  NativeSelect,
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
      <HStack gap={200}>
        <Button
          onClick={newRequestDisclosure.onOpen}
          disabled={!allConfirmed}
        >
          Submit New Request
        </Button>
        <FoodRequestFormModal
          previousRequest={undefined}
          isOpen={newRequestDisclosure.open}
          onClose={newRequestDisclosure.onClose}
        />
        {previousRequest && (
          <>
            <Button
              onClick={previousRequestDisclosure.onOpen}
              disabled={!allConfirmed}
            >
              Submit Previous Request
            </Button>
            <FoodRequestFormModal
              previousRequest={previousRequest}
              readOnly={false}
              isOpen={previousRequestDisclosure.open}
              onClose={previousRequestDisclosure.onClose}
            />
          </>
        )}
      </HStack>

      <NativeSelect.Root
        mt={4}
        width="50%"
      >
        <NativeSelect.Field 
          value={sortBy}
          onChange={(e) =>
            setSortBy(e.target.value as 'mostRecent' | 'oldest' | 'confirmed')
          }
        >
          <option value="mostRecent">Date Requested (Recent)</option>
          <option value="oldest">Date Requested (Oldest)</option>
          <option value="confirmed">Order Confirmation (Date Fulfilled)</option>
        </NativeSelect.Field>
        <NativeSelect.Indicator />
      </NativeSelect.Root>

      <Table.Root mt={6} width="80%">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>Request Id</Table.ColumnHeader>
            <Table.ColumnHeader>Order Id</Table.ColumnHeader>
            <Table.ColumnHeader>Date Requested</Table.ColumnHeader>
            <Table.ColumnHeader>Status</Table.ColumnHeader>
            <Table.ColumnHeader>Shipped By</Table.ColumnHeader>
            <Table.ColumnHeader>Date Fulfilled</Table.ColumnHeader>
            <Table.ColumnHeader>Actions</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {sortedRequests.map((request) => (
            <Table.Row key={request.requestId}>
              <Table.Cell>
                <Button onClick={() => setOpenReadOnlyRequest(request)}>
                  {request.requestId}
                </Button>
              </Table.Cell>
              <Table.Cell>
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
              </Table.Cell>
              <Table.Cell>{formatDate(request.requestedAt)}</Table.Cell>
              <Table.Cell>{request.order?.status ?? 'pending'}</Table.Cell>
              <Table.Cell>
                {request.order?.status === 'pending'
                  ? 'N/A'
                  : request.order?.shippedBy ?? 'N/A'}
              </Table.Cell>
              <Table.Cell>
                {formatReceivedDate(request.dateReceived)}
              </Table.Cell>
              <Table.Cell>
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
              </Table.Cell>
            </Table.Row>
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
        </Table.Body>
      </Table.Root>
    </Center>
  );
};

export default FormRequests;
