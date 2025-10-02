import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Center,
  Table,
  Text,
  HStack,
  Select,
  createListCollection,
} from '@chakra-ui/react';
import FoodRequestFormModalButton from '@components/forms/requestFormModalButton';
import DeliveryConfirmationModalButton from '@components/forms/deliveryConfirmationModalButton';
import { FoodRequest } from 'types/types';
import { formatDate, formatReceivedDate } from '@utils/utils';
import ApiClient from '@api/apiClient';
import OrderInformationModalButton from '@components/forms/orderInformationModalButton';

const FormRequests: React.FC = () => {
  const [requests, setRequests] = useState<FoodRequest[]>([]);
  const [previousRequest, setPreviousRequest] = useState<
    FoodRequest | undefined
  >(undefined);
  const [sortBy, setSortBy] = useState<'mostRecent' | 'oldest' | 'confirmed'>(
    'mostRecent',
  );
  const { pantryId } = useParams<{ pantryId: string }>();
  const [allConfirmed, setAllConfirmed] = useState(false);

  const sortOptions = createListCollection({
    items: [
      { label: 'Date Requested (Recent)', value: 'mostRecent' },
      { label: 'Date Requested (Oldest)', value: 'oldest' },
      { label: 'Order Confirmation (Date Fulfilled)', value: 'confirmed' },
    ],
  });

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
        <FoodRequestFormModalButton
          readOnly={false}
          buttonText="Submit New Request"
          disabled={!allConfirmed}
        />

        {previousRequest && (
          <FoodRequestFormModalButton
            previousRequest={previousRequest}
            readOnly={false}
            buttonText="Submit Previous Request"
            disabled={!allConfirmed}
          />
        )}
      </HStack>

      <Select.Root
        collection={sortOptions}
        mt={4}
        width="50%"
        value={[sortBy]}
        onValueChange={(e) =>
          setSortBy(e.value[0] as 'mostRecent' | 'oldest' | 'confirmed')
        }
      >
        <Select.Trigger>
          <Select.ValueText />
        </Select.Trigger>
        <Select.Content>
          {sortOptions.items.map((option) => (
            <Select.Item key={option.value} item={option}>
              <Select.ItemText>{option.label}</Select.ItemText>
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Root>

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
                <FoodRequestFormModalButton
                  previousRequest={request}
                  readOnly={true}
                  buttonText={request.requestId.toString()}
                  disabled={false}
                />
              </Table.Cell>
              <Table.Cell>
                {request.order?.orderId ? (
                  <OrderInformationModalButton
                    orderId={request.order.orderId}
                  />
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
                  <DeliveryConfirmationModalButton
                    requestId={request.requestId}
                  />
                )}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Center>
  );
};

export default FormRequests;
