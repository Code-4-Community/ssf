import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Table,
  Heading,
  VStack,
  Checkbox,
  Link,
} from '@chakra-ui/react';
import { ArrowDownUp, Funnel } from 'lucide-react';
import { capitalize, formatDate } from '@utils/utils';
import { FloatingAlert } from '@components/floatingAlert';
import { FoodRequestStatus, FoodRequestSummaryDto } from '../types/types';
import PageEmptyState from '@components/pageEmptyState';
import { PaginationControl } from '@components/pagination';
import RequestDetailsModal from '@components/forms/requestDetailsModal';
import PantryDeleteRequestActionModal from '@components/forms/pantryDeleteRequestModal';
import VolunteerCloseRequestActionModal from '@components/forms/volunteerCloseRequestModal';
import VolunteerRequestActionRequiredModal from '@components/forms/volunteerRequestActionRequiredModal';
import CreateNewOrderModal from '@components/forms/createNewOrderModal';
import { useAlert } from '../hooks/alert';
import { useNavigate, useLocation } from 'react-router-dom';
import { AlertStatus } from '../types/types';

interface RequestManagementProps {
  fetchRequests: () => Promise<FoodRequestSummaryDto[]>;
  enableVolunteerActions?: boolean;
  initialRequestId?: number;
}

const RequestManagement: React.FC<RequestManagementProps> = ({
  fetchRequests: fetchData,
  enableVolunteerActions = true,
  initialRequestId,
}) => {
  const [requests, setRequests] = useState<FoodRequestSummaryDto[]>([]);
  const [sortRequestedAtAsc, setSortRequestedAtAsc] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterPantryDropdownOpen, setIsFilterPantryDropdownOpen] =
    useState(false);
  const [selectedFilteredPantries, setSelectedFilteredPantries] = useState<
    string[]
  >([]);
  const [selectedViewDetailsRequest, setSelectedViewDetailsRequest] =
    useState<FoodRequestSummaryDto | null>(null);
  const [deleteRequest, setDeleteRequest] =
    useState<FoodRequestSummaryDto | null>(null);
  const [selectedActionRequest, setSelectedActionRequest] =
    useState<FoodRequestSummaryDto | null>(null);
  const [selectedCloseRequestAction, setSelectedCloseRequestAction] =
    useState<FoodRequestSummaryDto | null>(null);
  const [selectedCreateOrderRequest, setSelectedCreateOrderRequest] =
    useState<FoodRequestSummaryDto | null>(null);

  const [alertState, setAlertMessage] = useAlert();

  const navigate = useNavigate();
  const location = useLocation();

  const loadRequests = useCallback(async () => {
    try {
      const data = await fetchData();
      setRequests(data);
    } catch {
      setAlertMessage('Error fetching requests', AlertStatus.ERROR);
    }
  }, [fetchData, setAlertMessage]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedFilteredPantries]);

  useEffect(() => {
    if (!initialRequestId || requests.length === 0) return;
    const match = requests.find((r) => r.requestId === initialRequestId);

    if (match) {
      setSelectedViewDetailsRequest(match);

      // Paginate to the page that contains the deeplinked request
      const sortedAtLoad = [...requests].sort((a, b) =>
        b.requestedAt.localeCompare(a.requestedAt),
      );
      const idx = sortedAtLoad.findIndex(
        (r) => r.requestId === initialRequestId,
      );
      if (idx >= 0) {
        setCurrentPage(Math.floor(idx / itemsPerPage) + 1);
      }
    } else {
      navigate(location.pathname, { replace: true });
    }
  }, [initialRequestId, requests, navigate, location]);

  const pantryOptions = [
    ...new Set(
      requests
        .map((r) => r.pantry?.pantryName)
        .filter((name): name is string => !!name),
    ),
  ].sort((a, b) => a.localeCompare(b));

  const handleFilterChange = (pantry: string, checked: boolean) => {
    if (checked) {
      setSelectedFilteredPantries([...selectedFilteredPantries, pantry]);
    } else {
      setSelectedFilteredPantries(
        selectedFilteredPantries.filter((p) => p !== pantry),
      );
    }
  };

  const filteredRequests = requests
    .filter((r) => {
      const matchesFilter =
        selectedFilteredPantries.length === 0 ||
        (r.pantry && selectedFilteredPantries.includes(r.pantry?.pantryName));
      return matchesFilter;
    })
    .sort((a, b) =>
      sortRequestedAtAsc
        ? a.requestedAt.localeCompare(b.requestedAt)
        : b.requestedAt.localeCompare(a.requestedAt),
    );

  const itemsPerPage = 10;
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

  const clearActionRequest = () => setSelectedActionRequest(null);
  const clearCloseRequest = () => setSelectedCloseRequestAction(null);
  const clearCreateOrder = () => setSelectedCreateOrderRequest(null);

  return (
    <Box p={12}>
      <Heading textStyle="h1" color="gray.600" mb={6}>
        Food Request Management
      </Heading>
      {alertState && (
        <FloatingAlert
          key={alertState.id}
          message={alertState.message}
          status={alertState.status}
          timeout={6000}
        />
      )}
      {requests.length === 0 ? (
        <PageEmptyState entity="food requests" />
      ) : (
        <>
          <Box display="flex" gap={2} mb={6} fontFamily="'Inter', sans-serif">
            <Box position="relative">
              <Button
                onClick={() =>
                  setIsFilterPantryDropdownOpen(!isFilterPantryDropdownOpen)
                }
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

              {isFilterPantryDropdownOpen && (
                <>
                  <Box
                    position="fixed"
                    top={0}
                    left={0}
                    right={0}
                    bottom={0}
                    onClick={() => setIsFilterPantryDropdownOpen(false)}
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
                          checked={selectedFilteredPantries.includes(pantry)}
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
              onClick={() => setSortRequestedAtAsc((s) => !s)}
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
                  width={enableVolunteerActions ? '20%' : '40%'}
                >
                  Pantry
                </Table.ColumnHeader>
                <Table.ColumnHeader
                  {...tableHeaderStyles}
                  textAlign="right"
                  borderRight={enableVolunteerActions ? '1px solid' : undefined}
                  borderRightColor="neutral.100"
                  width={enableVolunteerActions ? '20%' : '30%'}
                >
                  Date Requested
                </Table.ColumnHeader>
                {enableVolunteerActions && (
                  <Table.ColumnHeader
                    {...tableHeaderStyles}
                    textAlign="right"
                    width="30%"
                  >
                    Action Required
                  </Table.ColumnHeader>
                )}
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {paginatedRequests.map((request) => (
                <Table.Row
                  key={request.requestId}
                  _hover={{ bg: 'neutral.50' }}
                >
                  <Table.Cell
                    {...tableCellStyles}
                    borderRight="1px solid"
                    borderRightColor="neutral.100"
                  >
                    <Link
                      textDecorationColor="black"
                      variant="underline"
                      onClick={() => setSelectedViewDetailsRequest(request)}
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
                    borderRight={
                      enableVolunteerActions ? '1px solid' : undefined
                    }
                    borderRightColor="neutral.100"
                    color="neutral.700"
                  >
                    {formatDate(request.requestedAt)}
                  </Table.Cell>
                  {enableVolunteerActions && (
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
                  )}
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>

          {selectedViewDetailsRequest && (
            <RequestDetailsModal
              request={selectedViewDetailsRequest}
              isOpen={selectedViewDetailsRequest !== null}
              onClose={() => {
                setSelectedViewDetailsRequest(null);
                if (initialRequestId) {
                  navigate(location.pathname, { replace: true });
                }
              }}
              onSuccess={loadRequests}
              onDelete={() => setDeleteRequest(selectedViewDetailsRequest)}
            />
          )}

          {deleteRequest && (
            <PantryDeleteRequestActionModal
              request={deleteRequest}
              isOpen={deleteRequest !== null}
              onClose={() => setDeleteRequest(null)}
              onSuccess={() => {
                setAlertMessage(
                  'Successfully deleted food request.',
                  AlertStatus.INFO,
                );
                loadRequests();
                setSelectedViewDetailsRequest(null);
              }}
            />
          )}

          {selectedActionRequest && (
            <VolunteerRequestActionRequiredModal
              isOpen={true}
              onClose={clearActionRequest}
              onCloseRequest={() => {
                setSelectedCloseRequestAction(selectedActionRequest);
              }}
              onCreateOrder={() => {
                setSelectedCreateOrderRequest(selectedActionRequest);
              }}
            />
          )}

          {selectedCloseRequestAction && (
            <VolunteerCloseRequestActionModal
              request={selectedCloseRequestAction}
              isOpen={true}
              onClose={clearCloseRequest}
              onSuccess={() => {
                setAlertMessage('Request Closed', AlertStatus.INFO);
                loadRequests();
              }}
            />
          )}

          {selectedCreateOrderRequest && (
            <CreateNewOrderModal
              request={selectedCreateOrderRequest}
              isOpen={true}
              onClose={clearCreateOrder}
              onSuccess={() => {
                setAlertMessage('Order Created', AlertStatus.INFO);
                loadRequests();
              }}
            />
          )}
        </>
      )}

      <Box mt={12}>
        <PaginationControl
          count={filteredRequests.length}
          pageSize={itemsPerPage}
          page={currentPage}
          onPageChange={setCurrentPage}
        />
      </Box>
    </Box>
  );
};

export default RequestManagement;
