import React, { useState, useEffect, useMemo } from 'react';
import { Funnel } from 'lucide-react';
import {
  Box,
  Button,
  Table,
  Heading,
  VStack,
  Text,
  RadioGroup,
  Spinner,
  Center,
} from '@chakra-ui/react';
import ApiClient from '@api/apiClient';
import { Pantry } from 'types/types';
import { RefrigeratedDonation } from '../types/pantryEnums';
import { Assignments } from './../types/types';
import { useNavigate } from 'react-router-dom';
import { FloatingAlert } from '@components/floatingAlert';

const AssignedPantries: React.FC = () => {
  const navigator = useNavigate();
  const [assignments, setAssignments] = useState<Assignments[]>([]);
  const [pantryDetails, setPantryDetails] = useState<Map<number, Pantry>>(
    new Map(),
  );
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterRefrigeratorFriendly, setFilterRefrigeratorFriendly] =
    useState<string>('all');
  const [alertMessage, setAlertMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  const isRefrigeratorFriendly = (pantryId: number): boolean => {
    const pantry = pantryDetails.get(pantryId);
    if (!pantry) return false;
    return (
      pantry.refrigeratedDonation === RefrigeratedDonation.YES ||
      pantry.refrigeratedDonation === RefrigeratedDonation.SOMETIMES
    );
  };

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const data = await ApiClient.getAllVolunteers();
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
        setAlertMessage('Error fetching assigned pantries');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssignments();
  }, []);

  const filteredAssignments = useMemo(() => {
    if (filterRefrigeratorFriendly === 'all') return assignments;

    const target = filterRefrigeratorFriendly === 'friendly';
    return assignments
      .map((a) => ({
        ...a,
        pantryIds: a.pantryIds.filter((id) => {
          const pantry = pantryDetails.get(id);
          if (!pantry) return false;
          return isRefrigeratorFriendly(pantry.pantryId) === target;
        }),
      }))
      .filter((a) => a.pantryIds.length > 0);
  }, [filterRefrigeratorFriendly, assignments, pantryDetails]);

  const getRefrigeratorFriendlyText = (pantryId: number): string => {
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
    py: 3,
    px: 4,
  };

  return (
    <Box p={12}>
      {alertMessage && (
        <FloatingAlert message={alertMessage} status="info" timeout={6000} />
      )}

      <Heading textStyle="h1" color="gray.light" mb={6}>
        Assigned Pantries
      </Heading>

      {isLoading ? (
        <Center mt={12}>
          <Spinner size="lg" />
        </Center>
      ) : (
        <>
          {/* Filter Button */}
          <Box display="flex" gap={2} mb={6}>
            <Box position="relative">
              <Button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                variant="outline"
                color="neutral.800"
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
                    <RadioGroup.Root
                      value={filterRefrigeratorFriendly}
                      onValueChange={(e: { value: string }) =>
                        setFilterRefrigeratorFriendly(e.value)
                      }
                    >
                      <VStack align="stretch" gap={2}>
                        <RadioGroup.Item value="all">
                          <RadioGroup.ItemHiddenInput />
                          <RadioGroup.ItemIndicator />
                          <RadioGroup.ItemText fontSize="sm">
                            Show All
                          </RadioGroup.ItemText>
                        </RadioGroup.Item>
                        <RadioGroup.Item value="friendly">
                          <RadioGroup.ItemHiddenInput />
                          <RadioGroup.ItemIndicator />
                          <RadioGroup.ItemText fontSize="sm">
                            Refrigerator-Friendly Only
                          </RadioGroup.ItemText>
                        </RadioGroup.Item>
                        <RadioGroup.Item value="not-friendly">
                          <RadioGroup.ItemHiddenInput />
                          <RadioGroup.ItemIndicator />
                          <RadioGroup.ItemText fontSize="sm">
                            Not Refrigerator-Friendly Only
                          </RadioGroup.ItemText>
                        </RadioGroup.Item>
                      </VStack>
                    </RadioGroup.Root>
                  </Box>
                </>
              )}
            </Box>
          </Box>

          {/* Pantries Table */}
          <Table.Root variant="line">
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
                  width="35%"
                  textAlign="right"
                >
                  Refrigerator-Friendly
                </Table.ColumnHeader>
                <Table.ColumnHeader
                  {...tableHeaderStyles}
                  textAlign="right"
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
                  const friendly = isRefrigeratorFriendly(pantryId);
                  return (
                    <Table.Row
                      key={`${assignment.id}-${pantryId}`}
                      _hover={{ bg: 'gray.50' }}
                    >
                      {/* Pantry Name */}
                      <Table.Cell
                        borderRight="1px solid"
                        borderRightColor="neutral.100"
                        px={4}
                        py={3}
                      >
                        <Text
                          as="span"
                          textStyle="p2"
                          fontFamily="inter"
                          textDecoration="underline"
                          cursor="pointer"
                          color="gray.800"
                        >
                          {pantry?.pantryName}
                        </Text>
                      </Table.Cell>

                      {/* Refrigerator-Friendly Badge */}
                      <Table.Cell px={4} py={3} textAlign="right">
                        <Box
                          bg={friendly ? 'neutral.100' : 'neutral.200'}
                          px={3}
                          py={1}
                          borderRadius="md"
                          display="inline-block"
                          fontSize="sm"
                          fontFamily="inter"
                          color="neutral.800"
                        >
                          {getRefrigeratorFriendlyText(pantryId)}
                        </Box>
                      </Table.Cell>

                      {/* Action */}
                      <Table.Cell px={4} py={3} textAlign="right">
                        <Button
                          variant="plain"
                          textDecoration="underline"
                          color="neutral.700"
                          textStyle="p2"
                          onClick={() => navigator(`/`)}
                          fontFamily="inter"
                          textAlign="right"
                          fontSize="sm"
                          p={0}
                          height="auto"
                          minW="auto"
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
        </>
      )}
    </Box>
  );
};

export default AssignedPantries;
