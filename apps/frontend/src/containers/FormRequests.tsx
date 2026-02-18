import React, { useCallback, useEffect, useState } from 'react';
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
import { OrderStatus, FoodRequest } from '../types/types';
import RequestDetailsModal from '@components/forms/requestDetailsModal';
import { formatDate } from '@utils/utils';
import ApiClient from '@api/apiClient';
import { useAuthenticator } from '@aws-amplify/ui-react';

const FormRequests: React.FC = () => {
  const { authStatus } = useAuthenticator((context) => [
    context.user,
    context.authStatus,
  ]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const newRequestDisclosure = useDisclosure();
  const previousRequestDisclosure = useDisclosure();

  const [pantryId, setPantryId] = useState<number>();
  const [requests, setRequests] = useState<FoodRequest[]>([]);
  const [previousRequest, setPreviousRequest] = useState<
    FoodRequest | undefined
  >(undefined);

  const [openReadOnlyRequest, setOpenReadOnlyRequest] =
    useState<FoodRequest | null>(null);

  const pageSize = 10;

  const fetchRequests = useCallback(async () => {
    const pantryId = await ApiClient.getCurrentUserPantryId();
    if (!pantryId) {
      alert('Could not find your pantry. Please try refreshing the page.');
      return;
    }
    setPantryId(pantryId);
    if (pantryId) {
      try {
        const data = await ApiClient.getPantryRequests(pantryId);
        const sortedData = data
          .slice()
          .sort((a, b) => b.requestId - a.requestId);
        setRequests(sortedData);
        if (sortedData.length > 0) {
          setPreviousRequest(sortedData[0]);
        }
      } catch (error) {
        console.log(error);
      }
    }
  }, []);

  useEffect(() => {
    if (authStatus !== 'authenticated') return;
    fetchRequests();
  }, [authStatus, fetchRequests]);

  const paginatedRequests = requests.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  return (
    <Box flexDirection="column" p={12}>
      <Text textStyle="h1" color="#515151">
        Food Request Management
      </Text>
      <HStack gap={3} my={5}>
        <Button
          fontFamily="ibm"
          fontWeight="semibold"
          fontSize="14px"
          color="neutral.50"
          bgColor="#2B4E60"
          onClick={newRequestDisclosure.onOpen}
          px={2}
        >
          New Request
        </Button>
        {pantryId && (
          <FoodRequestFormModal
            previousRequest={undefined}
            isOpen={newRequestDisclosure.open}
            onClose={newRequestDisclosure.onClose}
            pantryId={pantryId}
            onSuccess={fetchRequests}
          />
        )}
        {previousRequest && (
          <>
            <Button
              onClick={previousRequestDisclosure.onOpen}
              fontFamily="ibm"
              fontWeight="semibold"
              fontSize="14px"
              color="neutral.600"
              bgColor={'white'}
              borderColor="neutral.300"
              px={2}
            >
              Resubmit Latest
            </Button>
            {pantryId && (
              <FoodRequestFormModal
                previousRequest={previousRequest}
                isOpen={previousRequestDisclosure.open}
                onClose={previousRequestDisclosure.onClose}
                pantryId={pantryId}
                onSuccess={fetchRequests}
              />
            )}
          </>
        )}
      </HStack>
      <Table.Root mt={6} variant="line" showColumnBorder>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader
              color="neutral.800"
              textStyle="p2"
              fontWeight={600}
            >
              Request #
            </Table.ColumnHeader>
            <Table.ColumnHeader
              color="neutral.800"
              textStyle="p2"
              fontWeight={600}
            >
              Status
            </Table.ColumnHeader>
            <Table.ColumnHeader
              color="neutral.800"
              textStyle="p2"
              fontWeight={600}
              textAlign="right"
            >
              Date Requested
            </Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {paginatedRequests.map((request) => (
            <Table.Row key={request.requestId}>
              <Table.Cell color="#111111" textStyle="p2">
                <Link
                  textDecorationColor="#111111"
                  variant="underline"
                  onClick={() => setOpenReadOnlyRequest(request)}
                >
                  {request.requestId}
                </Link>
              </Table.Cell>
              <Table.Cell>
                {!request.orders ||
                request.orders.length === 0 ||
                request.orders.every(
                  (order) =>
                    order.status === OrderStatus.PENDING ||
                    order.status === OrderStatus.SHIPPED,
                ) ? (
                  <Badge
                    bgColor="#D4EAED"
                    color="#19717D"
                    textStyle="p2"
                    fontWeight={500}
                    fontSize={12}
                    py={1}
                    px={2}
                  >
                    Active
                  </Badge>
                ) : (
                  <Badge
                    bgColor="neutral.300"
                    color="#111111"
                    textStyle="p2"
                    fontWeight={500}
                    fontSize={12}
                    py={1}
                    px={2}
                  >
                    Closed
                  </Badge>
                )}
              </Table.Cell>
              <Table.Cell color="neutral.700" textStyle="p2" textAlign="right">
                {formatDate(request.requestedAt)}
              </Table.Cell>
            </Table.Row>
          ))}
          {openReadOnlyRequest && pantryId && (
            <RequestDetailsModal
              request={openReadOnlyRequest}
              isOpen={openReadOnlyRequest !== null}
              onClose={() => setOpenReadOnlyRequest(null)}
              pantryId={pantryId}
            />
          )}
        </Table.Body>
      </Table.Root>
      <Flex justify="center" mt={12}>
        <Pagination.Root
          count={Math.ceil(requests.length / pageSize)}
          pageSize={1}
          page={currentPage}
          onChange={(page: number) => setCurrentPage(page)}
        >
          <ButtonGroup variant="outline" size="sm">
            <Pagination.PrevTrigger asChild>
              <IconButton
                variant="ghost"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              >
                <ChevronLeft />
              </IconButton>
            </Pagination.PrevTrigger>

            <Pagination.Items
              render={(page) => (
                <IconButton
                  variant="outline"
                  _selected={{ borderColor: 'neutral.800' }}
                  onClick={() => setCurrentPage(page.value)}
                >
                  {page.value}
                </IconButton>
              )}
            />

            <Pagination.NextTrigger asChild>
              <IconButton
                variant="ghost"
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(prev + 1, Math.ceil(requests.length / pageSize)),
                  )
                }
              >
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
