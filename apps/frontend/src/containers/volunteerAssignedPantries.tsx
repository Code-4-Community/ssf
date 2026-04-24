import React, { useState, useEffect, useMemo } from 'react';
import { Funnel, CircleCheck } from 'lucide-react';
import {
  Box,
  Button,
  Table,
  Heading,
  VStack,
  Checkbox,
  Text,
  Spinner,
  Input,
} from '@chakra-ui/react';
import ApiClient from '@api/apiClient';
import { Pantry, User } from 'types/types';
import { RefrigeratedDonation } from '../types/pantryEnums';
import { FloatingAlert } from '@components/floatingAlert';
import { useNavigate } from 'react-router-dom';
import { useAlert } from '../hooks/alert';

const AssignedPantries: React.FC = () => {
  const navigate = useNavigate();
  const [pantries, setPantries] = useState<Pantry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedPantryIds, setSelectedPantryIds] = useState<Set<number>>(
    new Set(),
  );
  const [pantrySearch, setPantrySearch] = useState('');
  const [alertState, setAlertMessage] = useAlert();

  useEffect(() => {
    const fetchAssignedPantries = async () => {
      let user: User;
      let userId: number;
      try {
        user = await ApiClient.getMe();
        userId = user.id;
      } catch {
        setAlertMessage('Authentication error. Please log in and try again.');
        setIsLoading(false);
        return;
      }

      try {
        const data = await ApiClient.getVolunteerPantries(userId);
        setPantries(data);
      } catch {
        setAlertMessage('Error fetching assigned pantries');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssignedPantries();
  }, [setAlertMessage]);

  const isRefrigeratorFriendly = (pantry: Pantry): boolean => {
    return (
      pantry.refrigeratedDonation === RefrigeratedDonation.YES ||
      pantry.refrigeratedDonation === RefrigeratedDonation.SOMETIMES
    );
  };

  const filteredPantries = useMemo(() => {
    if (selectedPantryIds.size === 0) return pantries;
    return pantries.filter((pantry) => selectedPantryIds.has(pantry.pantryId));
  }, [selectedPantryIds, pantries]);

  const hasNoAssignedPantries = !isLoading && pantries.length === 0;
  const hasNoFilterResults =
    !isLoading && pantries.length > 0 && filteredPantries.length === 0;

  const isFiltered = selectedPantryIds.size > 0;

  const togglePantry = (pantryId: number) => {
    setSelectedPantryIds((prev) => {
      const next = new Set(prev);
      if (next.has(pantryId)) next.delete(pantryId);
      else next.add(pantryId);
      return next;
    });
  };

  const allChecked =
    pantries.length > 0 && selectedPantryIds.size === pantries.length;
  const isIndeterminate = selectedPantryIds.size > 0 && !allChecked;

  const toggleAll = () => {
    if (allChecked || isIndeterminate) {
      setSelectedPantryIds(new Set());
    } else {
      setSelectedPantryIds(new Set(pantries.map((p) => p.pantryId)));
    }
  };

  const visiblePantries = useMemo(() => {
    if (!pantrySearch.trim()) return pantries;
    return pantries.filter((p) =>
      p.pantryName.toLowerCase().includes(pantrySearch.toLowerCase()),
    );
  }, [pantrySearch, pantries]);

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
      {alertState && (
        <FloatingAlert
          key={alertState.id}
          message={alertState.message}
          status="error"
          timeout={6000}
        />
      )}

      <Heading textStyle="h1" color="gray.light" mb={6}>
        Assigned Pantries
      </Heading>

      {isLoading ? (
        <Box display="flex" justifyContent="center" mt={16}>
          <Spinner size="lg" color="gray.400" />
        </Box>
      ) : (
        <>
          {!hasNoAssignedPantries && (
            <Box display="flex" gap={2} mb={6}>
              <Box position="relative">
                <Button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  variant="outline"
                  color={isFiltered ? 'blue.600' : 'neutral.800'}
                  border="1px solid"
                  borderColor={isFiltered ? 'blue.300' : 'neutral.200'}
                  bg={isFiltered ? 'blue.50' : undefined}
                  size="sm"
                  p={3}
                  fontFamily="ibm"
                  fontWeight="semibold"
                >
                  <Funnel />
                  Filter
                  {isFiltered && (
                    <Box
                      as="span"
                      ml={1}
                      bg="blue.500"
                      color="white"
                      borderRadius="full"
                      fontSize="xs"
                      px={1.5}
                      lineHeight="1.4"
                    >
                      {selectedPantryIds.size}
                    </Box>
                  )}
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
                        <Input
                          placeholder="Search pantries..."
                          size="sm"
                          value={pantrySearch}
                          onChange={(e) => setPantrySearch(e.target.value)}
                          fontFamily="inter"
                        />

                        <Checkbox.Root
                          checked={
                            allChecked
                              ? true
                              : isIndeterminate
                              ? 'indeterminate'
                              : false
                          }
                          onCheckedChange={toggleAll}
                          size="sm"
                        >
                          <Checkbox.HiddenInput />
                          <Checkbox.Control />
                          <Checkbox.Label>
                            <Text
                              fontSize="sm"
                              fontWeight="semibold"
                              color="neutral.800"
                            >
                              Select All
                            </Text>
                          </Checkbox.Label>
                        </Checkbox.Root>

                        <Box borderBottom="1px solid" borderColor="gray.100" />

                        {visiblePantries.length > 0 ? (
                          visiblePantries.map((pantry) => (
                            <Checkbox.Root
                              key={pantry.pantryId}
                              checked={selectedPantryIds.has(pantry.pantryId)}
                              onCheckedChange={() =>
                                togglePantry(pantry.pantryId)
                              }
                              size="sm"
                            >
                              <Checkbox.HiddenInput />
                              <Checkbox.Control />
                              <Checkbox.Label>
                                <Text fontSize="sm" color="neutral.800">
                                  {pantry.pantryName}
                                </Text>
                              </Checkbox.Label>
                            </Checkbox.Root>
                          ))
                        ) : (
                          <Text
                            fontSize="sm"
                            color="neutral.500"
                            textAlign="center"
                            py={2}
                          >
                            No pantries found.
                          </Text>
                        )}
                      </VStack>
                    </Box>
                  </>
                )}
              </Box>
            </Box>
          )}

          {/* Empty States */}
          {(hasNoAssignedPantries || hasNoFilterResults) && (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              mt={16}
              gap={2}
            >
              <CircleCheck size={32} color="gray" />
              {hasNoAssignedPantries ? (
                <>
                  <Text fontWeight="semibold" fontSize="md" color="neutral.800">
                    No Assigned Pantries
                  </Text>
                  <Text textStyle="p2" color="neutral.700">
                    You have no assigned pantries at this time.
                  </Text>
                </>
              ) : (
                <>
                  <Text fontWeight="semibold" fontSize="md" color="neutral.800">
                    No Matching Pantries
                  </Text>
                  <Text textStyle="p2" color="neutral.700">
                    No pantries match the current filter.
                  </Text>
                </>
              )}
            </Box>
          )}

          {/* Pantries Table */}
          {filteredPantries.length > 0 && (
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
                    borderRight="1px solid"
                    borderRightColor="neutral.100"
                    width="35%"
                    textAlign="right"
                    pr={6}
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
                {filteredPantries.map((pantry) => (
                  <Table.Row
                    key={pantry.pantryId}
                    _hover={{ bg: 'neutral.50' }}
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
                        textDecoration="underline"
                        cursor="pointer"
                        color="gray.dark"
                      >
                        {pantry.pantryName}
                      </Text>
                    </Table.Cell>

                    {/* Refrigerator-Friendly Badge */}
                    <Table.Cell
                      borderRight="1px solid"
                      borderRightColor="neutral.100"
                      px={4}
                      py={3}
                    >
                      <Box display="flex" justifyContent="flex-end" pr={2}>
                        <Box
                          bg="neutral.200"
                          px={3}
                          py={1}
                          borderRadius="md"
                          fontSize="sm"
                          color="neutral.800"
                        >
                          {isRefrigeratorFriendly(pantry)
                            ? 'Refrigerator-Friendly'
                            : 'Not Refrigerator-Friendly'}
                        </Box>
                      </Box>
                    </Table.Cell>

                    {/* Action */}
                    <Table.Cell px={4} py={3} textAlign="right">
                      <Button
                        variant="plain"
                        textDecoration="underline"
                        color="neutral.700"
                        textStyle="p2"
                        onClick={() => navigate('/landing-page')}
                        p={0}
                        height="auto"
                        minW="auto"
                      >
                        View Orders
                      </Button>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          )}
        </>
      )}
    </Box>
  );
};

export default AssignedPantries;
