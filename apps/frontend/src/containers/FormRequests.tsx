import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Table,
  Text,
  Button,
  HStack,
  useDisclosure,
  Link,
  Badge,
  Pagination,
  ButtonGroup,
  IconButton,
  Flex,
} from '@chakra-ui/react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import FoodRequestFormModal from '@components/forms/requestFormModal';
import DeliveryConfirmationModal from '@components/forms/deliveryConfirmationModal';
import OrderInformationModal from '@components/forms/orderInformationModal';
import { OrderStatus, FoodRequest } from '../types/types';
import { formatDate } from '@utils/utils';
import ApiClient from '@api/apiClient';

const FormRequests: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const newRequestDisclosure = useDisclosure();
  const previousRequestDisclosure = useDisclosure();

  const [requests, setRequests] = useState<FoodRequest[]>([]);
  const [previousRequest, setPreviousRequest] = useState<
    FoodRequest | undefined
  >(undefined);

  const { pantryId: pantryIdParam } = useParams<{ pantryId: string }>();
  const pantryId = parseInt(pantryIdParam!, 10);

  const [openDeliveryRequestId, setOpenDeliveryRequestId] = useState<
    number | null
  >(null);
  const [openReadOnlyRequest, setOpenReadOnlyRequest] =
    useState<FoodRequest | null>(null);
  const [openOrderId, setOpenOrderId] = useState<number | null>(null);

  const pageSize = 8;

  useEffect(() => {
    setCurrentPage(1);
  }, []);

  useEffect(() => {
    const fetchRequests = async () => {
      if (pantryId) {
        try {
          const data = await ApiClient.getPantryRequests(pantryId);
          const sortedData = data.slice().sort((a, b) => b.requestId - a.requestId);
          setRequests(sortedData);

          if (sortedData.length > 0) {
            setPreviousRequest(sortedData[0]);
          }
        } catch (error) {
          alert('Error fetching requests: ' + error);
        }
      }
    };

    fetchRequests();
  }, [pantryId]);

  const paginatedRequests = requests.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <Box flexDirection="column" p={12}>
        <Text textStyle="h1" color="#515151">Food Request Management</Text>
        <HStack gap={3} my={5}>
          <Button textStyle="p2" color="neutral.50" bgColor="#2B4E60" onClick={newRequestDisclosure.onOpen}>
          New Request
          </Button>
          <FoodRequestFormModal
            previousRequest={undefined}
            isOpen={newRequestDisclosure.open}
            onClose={newRequestDisclosure.onClose}
            pantryId={pantryId}
          />
          {previousRequest && (
            <>
              <Button
                onClick={previousRequestDisclosure.onOpen}
                textStyle="p2"
                color="neutral.600" 
                bgColor={'white'}
                borderColor="neutral.300"
              >
                Resubmit Latest
              </Button>
              <FoodRequestFormModal
                previousRequest={previousRequest}
                readOnly={false}
                isOpen={previousRequestDisclosure.open}
                onClose={previousRequestDisclosure.onClose}
                pantryId={pantryId}
              />
            </>
          )}
        </HStack>
      <Table.Root mt={6}  variant="line" showColumnBorder>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader color="neutral.800" textStyle="p2" fontWeight={600}>Request #</Table.ColumnHeader>
            <Table.ColumnHeader color="neutral.800" textStyle="p2" fontWeight={600}>Status</Table.ColumnHeader>
            <Table.ColumnHeader color="neutral.800" textStyle="p2" fontWeight={600} textAlign="right">Date Requested</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {paginatedRequests.map((request) => (
            <Table.Row key={request.requestId}>
              <Table.Cell color="#111111" textStyle="p2">
                <Link textDecorationColor="#111111" variant="underline" onClick={() => setOpenReadOnlyRequest(request)}>
                  {request.requestId}
                </Link>
              </Table.Cell>
              <Table.Cell>
                {request.orders?.every(order => order.status === OrderStatus.DELIVERED) ? (
                  <Badge
                    bgColor="neutral.300"
                    color="#111111"
                    textStyle="p2"
                    fontWeight={500}
                    fontSize={12}
                  >
                    Closed
                  </Badge>
                ) : (
                  <Badge
                    bgColor="#D4EAED"
                    color="#19717D"
                    textStyle="p2"
                    fontWeight={500}
                    fontSize={12}
                  >
                    Active
                  </Badge>
                )}
              </Table.Cell>
              <Table.Cell color="neutral.700" textStyle="p2" textAlign="right">{formatDate(request.requestedAt)}</Table.Cell>
            </Table.Row>
          ))}
          {openReadOnlyRequest && (
            <FoodRequestFormModal
              previousRequest={openReadOnlyRequest}
              readOnly={true}
              isOpen={openReadOnlyRequest !== null}
              onClose={() => setOpenReadOnlyRequest(null)}
              pantryId={pantryId}
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
              pantryId={pantryId}
            />
          )}
        </Table.Body>
      </Table.Root>
      <Flex justify="center" mt={12}>
          <Pagination.Root count={Math.ceil(requests.length / pageSize)} pageSize={1} page={currentPage} onChange={(page) => setCurrentPage(page)}>
            <ButtonGroup variant="outline" size="sm">
              <Pagination.PrevTrigger asChild>
                <IconButton variant="ghost" onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}>
                  <ChevronLeft />
                </IconButton>
              </Pagination.PrevTrigger>

              <Pagination.Items
                render={(page) => (
                  <IconButton
                    variant={{ base: "outline", _selected: "outline" }}
                    onClick={() => setCurrentPage(page.value)}
                  >
                    {page.value}
                  </IconButton>
                )}
              />

              <Pagination.NextTrigger asChild>
                <IconButton variant="ghost" onClick={() => setCurrentPage((prev) => Math.min(prev + 1, Math.ceil(requests.length / pageSize)))}>
                  <ChevronRight />
                </IconButton>
              </Pagination.NextTrigger>
            </ButtonGroup>
          </Pagination.Root>
        </Flex>
    </Box>
  );
};

export default FormRequests;
