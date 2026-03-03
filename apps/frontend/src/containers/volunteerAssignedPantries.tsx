import React, { useState, useEffect, useMemo } from 'react';
import { Funnel } from 'lucide-react';
import {
  Box,
  Button,
  Table,
  Heading,
  VStack,
  Checkbox,
  Text,
} from '@chakra-ui/react';
import ApiClient from '@api/apiClient';
import { Pantry } from 'types/types';
import { RefrigeratedDonation } from '../types/pantryEnums';
import { Assignments } from 'types/volunteerAssignments';

const AssignedPantries: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignments[]>([]);
  const [pantryDetails, setPantryDetails] = useState<Map<number, Pantry>>(
    new Map(),
  );
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterRefrigeratorFriendly, setFilterRefrigeratorFriendly] = useState<
    boolean | null
  >(null);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const data = (await ApiClient.getAllVolunteers()) as Assignments[];
        setAssignments(data);

        const detailsMap = new Map<number, Pantry>();
        const allPantryIds = [...new Set(data.flatMap((a) => a.pantryIds))];
        await Promise.all(
          allPantryIds.map(async (id) => {
            try {
              const pantry = await ApiClient.getPantry(id);
              detailsMap.set(id, pantry);
            } catch (error) {
              console.error(`Error fetching pantry ${id}:`, error);
            }
          }),
        );
        setPantryDetails(detailsMap);
      } catch (error) {
        console.error('Error fetching assignments:', error);
        alert('Error fetching assigned pantries: ' + error);
      }
    };

    fetchAssignments();
  }, []);

  const filteredAssignments = useMemo(() => {
    if (filterRefrigeratorFriendly === null) return assignments;

    return assignments
      .map((a) => ({
        ...a,
        pantryIds: a.pantryIds.filter((id) => {
          const pantry = pantryDetails.get(id);
          if (!pantry) return false;
          const friendly =
            pantry.refrigeratedDonation === RefrigeratedDonation.YES ||
            pantry.refrigeratedDonation === RefrigeratedDonation.SOMETIMES;
          return friendly === filterRefrigeratorFriendly;
        }),
      }))
      .filter((a) => a.pantryIds.length > 0);
  }, [filterRefrigeratorFriendly, assignments, pantryDetails]);

  const handleViewOrders = (pantryId: number) => {
    console.log('View orders for pantry:', pantryId);
  };

  const isRefrigeratorFriendly = (pantryId: number): boolean => {
    const pantry = pantryDetails.get(pantryId);
    if (!pantry) return false;
    return (
      pantry.refrigeratedDonation === RefrigeratedDonation.YES ||
      pantry.refrigeratedDonation === RefrigeratedDonation.SOMETIMES
    );
  };

  const getRefrigeratorFriendlyText = (pantryId: number): string => {
    const pantry = pantryDetails.get(pantryId);
    if (!pantry) return 'Loading...';
    return isRefrigeratorFriendly(pantryId)
      ? 'Refrigerator-Friendly'
      : 'Not Refrigerator-Friendly';
  };

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
        Assigned Pantries
      </Heading>

      {/* Filter Button */}
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
                zIndex={20}
              >
                <VStack align="stretch" gap={2}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Checkbox.Root
                      checked={filterRefrigeratorFriendly === true}
                      onCheckedChange={(e: { checked: boolean }) =>
                        setFilterRefrigeratorFriendly(e.checked ? true : null)
                      }
                      color="black"
                      size="sm"
                    >
                      <Checkbox.HiddenInput />
                      <Checkbox.Control />
                    </Checkbox.Root>
                    <Text
                      fontSize="sm"
                      cursor="pointer"
                      onClick={() =>
                        setFilterRefrigeratorFriendly(
                          filterRefrigeratorFriendly === true ? null : true,
                        )
                      }
                    >
                      Refrigerator-Friendly Only
                    </Text>
                  </Box>

                  <Box display="flex" alignItems="center" gap={2}>
                    <Checkbox.Root
                      checked={filterRefrigeratorFriendly === false}
                      onCheckedChange={(e: { checked: boolean }) =>
                        setFilterRefrigeratorFriendly(e.checked ? false : null)
                      }
                      color="black"
                      size="sm"
                    >
                      <Checkbox.HiddenInput />
                      <Checkbox.Control />
                    </Checkbox.Root>
                    <Text
                      fontSize="sm"
                      cursor="pointer"
                      onClick={() =>
                        setFilterRefrigeratorFriendly(
                          filterRefrigeratorFriendly === false ? null : false,
                        )
                      }
                    >
                      Not Refrigerator-Friendly Only
                    </Text>
                  </Box>
                </VStack>
              </Box>
            </>
          )}
        </Box>
      </Box>

      {/* Pantries Table */}
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader
              {...tableHeaderStyles}
              borderRight="1px solid"
              borderRightColor="neutral.100"
              width="40%"
            >
              Pantry
            </Table.ColumnHeader>
            <Table.ColumnHeader
              {...tableHeaderStyles}
              borderRight="1px solid"
              borderRightColor="neutral.100"
              width="35%"
            >
              Refrigerator-Friendly
            </Table.ColumnHeader>
            <Table.ColumnHeader
              {...tableHeaderStyles}
              textAlign="center"
              width="25%"
            >
              Action
            </Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {filteredAssignments.flatMap((assignment) =>
            assignment.pantryIds.map((pantryId) => {
              const pantry = pantryDetails.get(pantryId);
              return (
                <Table.Row
                  key={`${assignment.id}-${pantryId}`}
                  _hover={{ bg: 'gray.50' }}
                >
                  <Table.Cell
                    textStyle="p2"
                    borderRight="1px solid"
                    borderRightColor="neutral.100"
                    py={0}
                  >
                    <Button
                      variant="plain"
                      textDecoration="underline"
                      fontFamily="inter"
                    >
                      {pantry?.pantryName ?? 'Loading...'}
                    </Button>
                  </Table.Cell>
                  <Table.Cell
                    textStyle="p2"
                    borderRight="1px solid"
                    borderRightColor="neutral.100"
                    color="neutral.700"
                  >
                    <Box
                      bg={
                        isRefrigeratorFriendly(pantryId)
                          ? 'gray.100'
                          : 'orange.50'
                      }
                      px={3}
                      py={1}
                      borderRadius="md"
                      display="inline-block"
                      fontSize="sm"
                      fontFamily="inter"
                    >
                      {getRefrigeratorFriendlyText(pantryId)}
                    </Box>
                  </Table.Cell>
                  <Table.Cell textStyle="p2" textAlign="center">
                    <Button
                      variant="plain"
                      textDecoration="underline"
                      color="blue.600"
                      onClick={() => handleViewOrders(pantryId)}
                      fontFamily="inter"
                      fontSize="sm"
                    >
                      View Orders
                    </Button>
                  </Table.Cell>
                </Table.Row>
              );
            }),
          )}
        </Table.Body>
      </Table.Root>
    </Box>
  );
};

export default AssignedPantries;
