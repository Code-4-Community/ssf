import React, { useState, useEffect } from 'react';
import { ArrowDownUp, ChevronRight, ChevronLeft, Funnel } from 'lucide-react';
import {
  Box,
  Button,
  Table,
  Heading,
  Pagination,
  IconButton,
  Checkbox,
  VStack,
  ButtonGroup,
} from '@chakra-ui/react';
import { Donation } from 'types/types';
import DonationDetailsModal from '@components/forms/donationDetailsModal';
import ApiClient from '@api/apiClient';
import { formatDate } from '@utils/utils';

const AdminDonation: React.FC = () => {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [sortAsc, setSortAsc] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedManufacturers, setSelectedManufacturers] = useState<string[]>(
    [],
  );
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(
    null,
  );

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const data = await ApiClient.getAllDonations();
        setDonations(data);
      } catch (error) {
        alert('Error fetching donations: ' + error);
      }
    };
    fetchDonations();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedManufacturers]);

  const manufacturerOptions = [
    ...new Set(
      donations
        .map((d) => d.foodManufacturer?.foodManufacturerName)
        .filter((name): name is string => !!name),
    ),
  ].sort((a, b) => a.localeCompare(b));

  const handleFilterChange = (manufacturer: string, checked: boolean) => {
    if (checked) {
      setSelectedManufacturers([...selectedManufacturers, manufacturer]);
    } else {
      setSelectedManufacturers(
        selectedManufacturers.filter((m) => m !== manufacturer),
      );
    }
  };

  const filteredDonations = donations
    .filter((d) => {
      const matchesFilter =
        selectedManufacturers.length === 0 ||
        (d.foodManufacturer &&
          selectedManufacturers.includes(
            d.foodManufacturer?.foodManufacturerName,
          ));
      return matchesFilter;
    })
    .sort((a, b) =>
      sortAsc
        ? a.dateDonated.localeCompare(b.dateDonated)
        : b.dateDonated.localeCompare(a.dateDonated),
    );

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredDonations.length / itemsPerPage);
  const paginatedDonations = filteredDonations.slice(
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

  return (
    <Box p={12}>
      <Heading textStyle="h1" color="gray.600" mb={6}>
        Donation Management
      </Heading>
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
                  {manufacturerOptions.map((manufacturer) => (
                    <Checkbox.Root
                      key={manufacturer}
                      checked={selectedManufacturers.includes(manufacturer)}
                      onCheckedChange={(e: { checked: boolean }) =>
                        handleFilterChange(manufacturer, e.checked)
                      }
                      color="black"
                      size="sm"
                    >
                      <Checkbox.HiddenInput />
                      <Checkbox.Control borderRadius="sm" />
                      <Checkbox.Label>{manufacturer}</Checkbox.Label>
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
              width="10%"
            >
              Donation #
            </Table.ColumnHeader>
            <Table.ColumnHeader
              {...tableHeaderStyles}
              borderRight="1px solid"
              borderRightColor="neutral.100"
              width="65%"
            >
              Manufacturer
            </Table.ColumnHeader>
            <Table.ColumnHeader
              {...tableHeaderStyles}
              textAlign="right"
              width="25%"
            >
              Date Started
            </Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {paginatedDonations.map((donation, index) => (
            <Table.Row
              key={`${donation.donationId}-${index}`}
              _hover={{ bg: 'gray.50' }}
            >
              <Table.Cell
                textStyle="p2"
                borderRight="1px solid"
                borderRightColor="neutral.100"
              >
                <Button
                  variant="plain"
                  textDecoration="underline"
                  onClick={() => setSelectedDonation(donation)}
                >
                  {donation.donationId}
                </Button>
                {selectedDonation && (
                  <DonationDetailsModal
                    donation={selectedDonation}
                    isOpen={selectedDonation !== null}
                    onClose={() => setSelectedDonation(null)}
                  />
                )}
              </Table.Cell>
              <Table.Cell
                textStyle="p2"
                borderRight="1px solid"
                borderRightColor="neutral.100"
              >
                {donation.foodManufacturer?.foodManufacturerName}
              </Table.Cell>
              <Table.Cell textStyle="p2" textAlign="right" color="neutral.700">
                {formatDate(donation.dateDonated)}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>

      {totalPages > 1 && (
        <Pagination.Root
          count={filteredDonations.length}
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

export default AdminDonation;
