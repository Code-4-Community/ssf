import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Table,
  Heading,
  Pagination,
  IconButton,
  VStack,
  ButtonGroup,
  Checkbox,
  Link,
} from '@chakra-ui/react';
import { ArrowDownUp, ChevronRight, ChevronLeft, Funnel } from 'lucide-react';
import { capitalize, formatDate } from '@utils/utils';
import ApiClient from '@api/apiClient';
import { FloatingAlert } from '@components/floatingAlert';
import { FoodRequest, FoodRequestStatus } from '../types/types';
import RequestDetailsModal from '@components/forms/requestDetailsModal';
import VolunteerCloseRequestActionModal from '@components/forms/volunteerCloseRequestModal';
import VolunteerRequestActionRequiredModal from '@components/forms/volunteerRequestActionRequiredModal';
import CreateNewOrderModal from '@components/forms/createNewOrderModal';
import { useAlert } from '../hooks/alert';

const VolunteerRequestManagement: React.FC = () => {
  const [requests, setRequests] = useState<FoodRequest[]>([]);
  const [sortAsc, setSortAsc] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedPantries, setSelectedPantries] = useState<string[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<FoodRequest | null>(
    null,
  );

  const [selectedActionRequest, setSelectedActionRequest] =
    useState<FoodRequest | null>(null);
  const [selectedCloseRequestAction, setSelectedCloseRequestAction] =
    useState<FoodRequest | null>(null);
  const [selectedCreateOrderRequest, setSelectedCreateOrderRequest] =
    useState<FoodRequest | null>(null);

  const [alertState, setAlertMessage] = useAlert();
  const [isAlertError, setIsAlertError] = useState<boolean>(true);

  const fetchRequests = async () => {
    try {
      const data = await ApiClient.getVolunteerAssignedRequests();
      setRequests(data);
    } catch (error) {
      setIsAlertError(true);
      setAlertMessage('Error fetching requests' + error);
    }
  };

  useEffect(() => {
    fetchRequests();
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedPantries]);

  const pantryOptions = [
    ...new Set(
      requests
        .map((r) => r.pantry?.pantryName)
        .filter((name): name is string => !!name),
    ),
  ].sort((a, b) => a.localeCompare(b));

  const handleFilterChange = (pantry: string, checked: boolean) => {
    if (checked) {
      setSelectedPantries([...selectedPantries, pantry]);
    } else {
      setSelectedPantries(selectedPantries.filter((p) => p !== pantry));
    }
  };

  const filteredRequests = requests
    .filter((r) => {
      const matchesFilter =
        selectedPantries.length === 0 ||
        (r.pantry && selectedPantries.includes(r.pantry?.pantryName));
      return matchesFilter;
    })
    .sort((a, b) =>
      sortAsc
        ? a.requestedAt.localeCompare(b.requestedAt)
        : b.requestedAt.localeCompare(a.requestedAt),
    );

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const tableHeaderStyles = {
    borderBottom: '1px solid',
    borderColor: 'neutral.100',
    color: 'neutral.800',
    fontFamily: 'inter',
    fontWeight: '600',
    fontSize: 'sm',
  };

  const tableCellStyles = {
    borderBottom: '1px solid',
    borderColor: 'neutral.100',
    color: 'black',
    fontFamily: "'Inter', sans-serif",
    fontSize: 'sm',
    py: 0,
  };

  return (
    <Box p={12}>
      <Heading textStyle="h1" color="gray.600" mb={6}>
        Food Request Management
      </Heading>
      {alertState && (
        <FloatingAlert
          key={alertState.id}
          message={alertState.message}
          status={isAlertError ? 'error' : 'info'}
          timeout={6000}
        />
      )}
      <Box display="flex" gap={2} mb={6} fontFamily="'Inter', sans-serif">
        <Box position="relative">
          <Button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            variant="outline"
            color="neutral.600"
            border="1px solid"
            borderColor="neutral.200"
            size="sm"
            p={3}
            fontFamily="ibm"
            fontWeight="semibold"
          >
            <Funnel />
            Filter
          </Button>

          {isFilterOpen && (
            <>
              <Box
                position="fixed"
                top={0}
                left={0}
                right={0}
                bottom={0}
                onClick={() => setIsFilterOpen(false)}
                zIndex={10}
              />
              <Box
                position="absolute"
                top="100%"
                left={0}
                mt={2}
                bg="white"
                border="1px solid"
                borderColor="gray.200"
                borderRadius="md"
                boxShadow="lg"
                p={4}
                minW="275px"
                maxH="150px"
                overflowY="auto"
                zIndex={20}
              >
                <VStack align="stretch" gap={2}>
                  {pantryOptions.map((pantry) => (
                    <Checkbox.Root
                      key={pantry}
                      checked={selectedPantries.includes(pantry)}
                      onCheckedChange={(e: { checked: boolean }) =>
                        handleFilterChange(pantry, e.checked)
                      }
                      color="black"
                      size="sm"
                    >
                      <Checkbox.HiddenInput />
                      <Checkbox.Control borderRadius="sm" />
                      <Checkbox.Label>{pantry}</Checkbox.Label>
                    </Checkbox.Root>
                  ))}
                </VStack>
              </Box>
            </>
          )}
        </Box>
        <Button
          onClick={() => setSortAsc((s) => !s)}
          variant="outline"
          color="neutral.600"
          border="1px solid"
          borderColor="neutral.200"
          p={3}
          size="sm"
          fontFamily="ibm"
          fontWeight="semibold"
        >
          <ArrowDownUp />
          Sort
        </Button>
      </Box>
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader
              {...tableHeaderStyles}
              borderRight="1px solid"
              borderRightColor="neutral.100"
              width="15%"
            >
              Request #
            </Table.ColumnHeader>
            <Table.ColumnHeader
              {...tableHeaderStyles}
              borderRight="1px solid"
              borderRightColor="neutral.100"
              width="15%"
            >
              Status
            </Table.ColumnHeader>
            <Table.ColumnHeader
              {...tableHeaderStyles}
              borderRight="1px solid"
              borderRightColor="neutral.100"
              width="20%"
            >
              Pantry
            </Table.ColumnHeader>
            <Table.ColumnHeader
              {...tableHeaderStyles}
              textAlign="right"
              borderRight="1px solid"
              borderRightColor="neutral.100"
              width="20%"
            >
              Date Requested
            </Table.ColumnHeader>
            <Table.ColumnHeader
              {...tableHeaderStyles}
              textAlign="right"
              width="30%"
            >
              Action Required
            </Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {paginatedRequests.map((request, index) => (
            <Table.Row
              key={`${request.requestId}-${index}`}
              _hover={{ bg: 'gray.50' }}
            >
              <Table.Cell
                {...tableCellStyles}
                borderRight="1px solid"
                borderRightColor="neutral.100"
              >
                <Link
                  textDecorationColor="black"
                  variant="underline"
                  onClick={() => setSelectedRequest(request)}
                >
                  {request.requestId}
                </Link>
              </Table.Cell>
              <Table.Cell
                {...tableCellStyles}
                borderRight="1px solid"
                borderRightColor="neutral.100"
              >
                <Box
                  borderRadius="md"
                  bg={
                    request.status === FoodRequestStatus.ACTIVE
                      ? 'teal.200'
                      : 'neutral.300'
                  }
                  color={
                    request.status === FoodRequestStatus.ACTIVE
                      ? 'teal.hover'
                      : 'black'
                  }
                  display="inline-block"
                  fontWeight="500"
                  fontSize="12px"
                  my={3}
                  py={0.5}
                  px={3}
                >
                  {capitalize(request.status)}
                </Box>
              </Table.Cell>
              <Table.Cell
                {...tableCellStyles}
                borderRight="1px solid"
                borderRightColor="neutral.100"
              >
                {request.pantry.pantryName}
              </Table.Cell>
              <Table.Cell
                {...tableCellStyles}
                textAlign="right"
                borderRight="1px solid"
                borderRightColor="neutral.100"
                color="neutral.700"
              >
                {formatDate(request.requestedAt)}
              </Table.Cell>
              <Table.Cell
                {...tableCellStyles}
                bgColor={
                  request.status !== FoodRequestStatus.ACTIVE
                    ? 'neutral.50'
                    : 'white'
                }
                textAlign="right"
                color="neutral.700"
                pr={0}
              >
                {request.status === FoodRequestStatus.ACTIVE && (
                  <Button
                    variant="plain"
                    fontWeight="400"
                    textDecoration="underline"
                    color="neutral.700"
                    onClick={() => setSelectedActionRequest(request)}
                  >
                    Complete Required Action
                  </Button>
                )}
              </Table.Cell>
            </Table.Row>
          ))}

          {selectedRequest && (
            <RequestDetailsModal
              request={selectedRequest}
              isOpen={selectedRequest !== null}
              onClose={() => setSelectedRequest(null)}
            />
          )}

          {selectedActionRequest && (
            <VolunteerRequestActionRequiredModal
              isOpen={true}
              onClose={() => setSelectedActionRequest(null)}
              onCloseRequest={() => {
                setSelectedCloseRequestAction(selectedActionRequest);
                setSelectedActionRequest(null);
              }}
              onCreateOrder={() => {
                setSelectedCreateOrderRequest(selectedActionRequest);
                setSelectedActionRequest(null);
              }}
            />
          )}

          {selectedCloseRequestAction && (
            <VolunteerCloseRequestActionModal
              request={selectedCloseRequestAction}
              isOpen={true}
              onClose={() => setSelectedCloseRequestAction(null)}
              onSuccess={() => {
                setSelectedCloseRequestAction(null);
                setIsAlertError(false);
                setAlertMessage('Request Closed');
                fetchRequests();
              }}
            ></VolunteerCloseRequestActionModal>
          )}

          {selectedCreateOrderRequest && (
            <CreateNewOrderModal
              request={selectedCreateOrderRequest}
              isOpen={true}
              onClose={() => setSelectedCreateOrderRequest(null)}
              onOrderCreate={() => {
                setSelectedCreateOrderRequest(null);
                setIsAlertError(false);
                setAlertMessage('Order Created');
                fetchRequests();
              }}
            ></CreateNewOrderModal>
          )}
        </Table.Body>
      </Table.Root>

      {totalPages > 1 && (
        <Pagination.Root
          count={filteredRequests.length}
          pageSize={itemsPerPage}
          page={currentPage}
          onPageChange={(e: { page: number }) => setCurrentPage(e.page)}
        >
          <ButtonGroup
            display="flex"
            justifyContent="center"
            alignItems="center"
            mt={12}
            variant="outline"
            size="sm"
          >
            <Pagination.PrevTrigger
              color="neutral.800"
              variant="outline"
              _hover={{ color: 'black', cursor: 'pointer' }}
            >
              <ChevronLeft size={16} />
            </Pagination.PrevTrigger>

            <Pagination.Items
              render={(page) => (
                <IconButton
                  borderColor={{
                    base: 'neutral.100',
                    _selected: 'neutral.600',
                  }}
                >
                  {page.value}
                </IconButton>
              )}
            />

            <Pagination.NextTrigger
              color="neutral.800"
              variant="ghost"
              _hover={{ color: 'black', cursor: 'pointer' }}
            >
              <ChevronRight size={16} />
            </Pagination.NextTrigger>
          </ButtonGroup>
        </Pagination.Root>
      )}
    </Box>
  );
};

export default VolunteerRequestManagement;
