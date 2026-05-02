import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Table,
  Heading,
  Pagination,
  IconButton,
  ButtonGroup,
  Link,
} from '@chakra-ui/react';
import { ChevronRight, ChevronLeft, Mail, CircleCheck } from 'lucide-react';
import { capitalize, formatDate, DONATION_STATUS_COLORS } from '@utils/utils';
import ApiClient from '@api/apiClient';
import { DonationDetails, DonationStatus } from '../types/types';
import DonationDetailsModal from '@components/forms/donationDetailsModal';
import NewDonationFormModal from '@components/forms/newDonationFormModal';
import FmCompleteRequiredActionsModal from '@components/forms/fmCompleteRequiredActionsModal';
import { FloatingAlert } from '@components/floatingAlert';
import { useAlert } from '../hooks/alert';

const FoodManufacturerDonationManagement: React.FC = () => {
  const [alertState, setAlertMessage] = useAlert();
  const [isLogDonationOpen, setIsLogDonationOpen] = useState(false);
  const [manufacturerId, setManufacturerId] = useState<number | null>(null);
  const [selectedActionDonation, setSelectedActionDonation] =
    useState<DonationDetails | null>(null);
  // State to hold donations grouped by status
  const [statusDonations, setStatusDonations] = useState<{
    [key in DonationStatus]: DonationDetails[];
  }>({
    [DonationStatus.MATCHED]: [],
    [DonationStatus.AVAILABLE]: [],
    [DonationStatus.FULFILLED]: [],
  });

  // State to hold selected donation for details modal
  const [selectedDonationId, setSelectedDonationId] = useState<number | null>(
    null,
  );

  // State to hold current page per status
  const [currentPages, setCurrentPages] = useState<
    Record<DonationStatus, number>
  >({
    [DonationStatus.MATCHED]: 1,
    [DonationStatus.AVAILABLE]: 1,
    [DonationStatus.FULFILLED]: 1,
  });

  const MAX_PER_STATUS = 5;

  // Fetch all donations on component mount and sorts them into their appropriate status lists
  const fetchDonations = async (fmId: number) => {
    try {
      const data = await ApiClient.getAllDonationsByFoodManufacturer(fmId);

      const grouped: Record<DonationStatus, DonationDetails[]> = {
        [DonationStatus.AVAILABLE]: [],
        [DonationStatus.FULFILLED]: [],
        [DonationStatus.MATCHED]: [],
      };

      data.forEach((donationDetail: DonationDetails) => {
        grouped[donationDetail.donation.status].push(donationDetail);
      });

      (Object.keys(grouped) as DonationStatus[]).forEach((status) => {
        grouped[status].sort(
          (a, b) =>
            new Date(a.donation.dateDonated).getTime() -
            new Date(b.donation.dateDonated).getTime(),
        );
      });

      setStatusDonations(grouped);

      // Initialize current page for each status
      const initialPages: Record<DonationStatus, number> = {
        [DonationStatus.AVAILABLE]: 1,
        [DonationStatus.FULFILLED]: 1,
        [DonationStatus.MATCHED]: 1,
      };
      setCurrentPages(initialPages);
    } catch (error) {
      alert('Error fetching donations: ' + error);
    }
  };

  // On page load, get the food manufacturer id and all appropriate donations
  useEffect(() => {
    const init = async () => {
      try {
        const fmId = await ApiClient.getCurrentUserFoodManufacturerId();
        setManufacturerId(fmId);
        await fetchDonations(fmId);
      } catch (error) {
        alert('Error initializing donation management: ' + error);
      }
    };
    init();
  }, []);

  const handlePageChange = (status: DonationStatus, page: number) => {
    setCurrentPages((prev) => ({
      ...prev,
      [status]: page,
    }));
  };

  return (
    <Box p={12}>
      {alertState && (
        <FloatingAlert
          key={alertState.id}
          message={alertState.message}
          status="info"
          timeout={6000}
        />
      )}
      <Heading textStyle="h1" color="gray.600" mb={8}>
        Donation Management
      </Heading>

      <Button
        display="inline-flex"
        alignItems="center"
        justifyContent="space-between"
        backgroundColor="blue.ssf"
        fontFamily="ibm"
        fontWeight="semibold"
        p={3}
        mb={16}
        borderRadius="md"
        minW="fit-content"
        color="neutral.50"
        onClick={() => setIsLogDonationOpen(true)}
      >
        Log New Donation
      </Button>

      {isLogDonationOpen && manufacturerId !== null && (
        <NewDonationFormModal
          foodManufacturerId={manufacturerId}
          onDonationSuccess={() => fetchDonations(manufacturerId)}
          isOpen={isLogDonationOpen}
          onClose={() => setIsLogDonationOpen(false)}
        />
      )}

      {selectedActionDonation && (
        <FmCompleteRequiredActionsModal
          donation={selectedActionDonation}
          isOpen={true}
          onClose={() => setSelectedActionDonation(null)}
          onSuccess={() => {
            setSelectedActionDonation(null);
            if (manufacturerId !== null) fetchDonations(manufacturerId);
            setAlertMessage(
              'Your details have been saved. Actions are complete once all shipment and item details are confirmed',
            );
          }}
        />
      )}

      {Object.values(DonationStatus).map((status) => {
        const allDonationsByStatus = statusDonations[status] || [];

        const currentPage = currentPages[status] || 1;
        const displayedDonations = allDonationsByStatus.slice(
          (currentPage - 1) * MAX_PER_STATUS,
          currentPage * MAX_PER_STATUS,
        );

        return (
          <Box key={status} mb={14}>
            <DonationStatusSection
              donations={displayedDonations}
              status={status}
              colors={DONATION_STATUS_COLORS[status]}
              selectedDonationId={selectedDonationId}
              onDonationSelect={setSelectedDonationId}
              totalDonations={allDonationsByStatus.length}
              currentPage={currentPage}
              onPageChange={(page) => handlePageChange(status, page)}
              onActionSelect={setSelectedActionDonation}
            />
          </Box>
        );
      })}
    </Box>
  );
};

interface DonationStatusSectionProps {
  donations: DonationDetails[];
  status: DonationStatus;
  colors: string[];
  onDonationSelect: (donationId: number | null) => void;
  selectedDonationId: number | null;
  totalDonations: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onActionSelect: (donation: DonationDetails | null) => void;
}

const DonationStatusSection: React.FC<DonationStatusSectionProps> = ({
  donations,
  status,
  colors,
  onDonationSelect,
  selectedDonationId,
  totalDonations,
  currentPage,
  onPageChange,
  onActionSelect,
}) => {
  const MAX_PER_STATUS = 5;
  const totalPages = Math.ceil(totalDonations / MAX_PER_STATUS);

  const tableHeaderStyles = {
    borderBottom: '1px solid',
    borderColor: 'neutral.100',
    color: 'neutral.800',
    fontFamily: 'ibm',
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
    <Box>
      <Box
        display="inline-flex"
        alignItems="center"
        justifyContent="space-between"
        backgroundColor={colors[0]}
        p={3}
        mb={6}
        borderRadius="md"
        minW="fit-content"
      >
        <Mail size={18} />
        <Box
          ml={3}
          fontFamily="ibm"
          fontSize="14px"
          fontWeight="semibold"
          color="neutral.700"
        >
          {capitalize(status)}
        </Box>
      </Box>

      {donations.length === 0 ? (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
          fontFamily="'Inter', sans-serif"
          fontSize="sm"
          color="neutral.600"
          py={10}
          gap={2}
        >
          <Box mb={2}>
            <CircleCheck size={24} color="#262626" />
          </Box>
          <Box fontWeight="600" fontSize="lg" color="neutral.800">
            No Donations
          </Box>
          <Box color="neutral.700" fontWeight="400">
            You have no {status.toLowerCase()} donations at this time.
          </Box>
        </Box>
      ) : (
        <>
          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader
                  {...tableHeaderStyles}
                  borderRight="1px solid"
                  borderRightColor="neutral.100"
                  width="15%"
                >
                  Donation #
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
                  Date Donated
                </Table.ColumnHeader>
                <Table.ColumnHeader
                  {...tableHeaderStyles}
                  textAlign="right"
                  width="50%"
                >
                  Action Required
                </Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {donations.map((donationDetail, index) => {
                const donation = donationDetail.donation;
                return (
                  <Table.Row
                    key={`${donation.donationId}-${index}`}
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
                        onClick={() => onDonationSelect(donation.donationId)}
                      >
                        {donation.donationId}
                      </Link>
                      {selectedDonationId === donation.donationId && (
                        <DonationDetailsModal
                          donation={donation}
                          isOpen={true}
                          onClose={() => onDonationSelect(null)}
                        />
                      )}
                    </Table.Cell>
                    <Table.Cell
                      {...tableCellStyles}
                      borderRight="1px solid"
                      borderRightColor="neutral.100"
                    >
                      <Box
                        borderRadius="md"
                        bg={colors[0]}
                        color={colors[1]}
                        display="inline-block"
                        fontSize="12px"
                        fontWeight="500"
                        my={2}
                        py={1}
                        px={3}
                      >
                        {capitalize(donation.status)}
                      </Box>
                    </Table.Cell>
                    <Table.Cell
                      {...tableCellStyles}
                      borderRight="1px solid"
                      borderRightColor="neutral.100"
                    >
                      {formatDate(donation.dateDonated)}
                    </Table.Cell>
                    <Table.Cell
                      {...tableCellStyles}
                      textAlign="right"
                      color="neutral.700"
                    >
                      {donationDetail.associatedPendingOrders.length > 0 ? (
                        <Link
                          textDecorationColor="black"
                          variant="underline"
                          onClick={() => onActionSelect(donationDetail)}
                        >
                          Complete Required Actions
                        </Link>
                      ) : (
                        'No Action Required'
                      )}
                    </Table.Cell>
                  </Table.Row>
                );
              })}
            </Table.Body>
          </Table.Root>

          {totalPages > 1 && (
            <Box mt={4}>
              <Pagination.Root
                count={totalDonations}
                pageSize={MAX_PER_STATUS}
                page={currentPage}
                onPageChange={(e: { page: number }) => onPageChange(e.page)}
              >
                <ButtonGroup
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  variant="outline"
                  size="sm"
                  gap={4}
                >
                  <Pagination.PrevTrigger
                    color="neutral.800"
                    _hover={{ color: 'black' }}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft
                      size={16}
                      style={{
                        cursor: currentPage !== 1 ? 'pointer' : 'default',
                      }}
                    />
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
                    _hover={{ color: 'black' }}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight
                      size={16}
                      style={{
                        cursor:
                          currentPage !== totalPages ? 'pointer' : 'default',
                      }}
                    />
                  </Pagination.NextTrigger>
                </ButtonGroup>
              </Pagination.Root>
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default FoodManufacturerDonationManagement;
