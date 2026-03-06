import React, { useState, useEffect, useMemo } from 'react';
import { Funnel, CircleCheck } from 'lucide-react';
import {
  Box,
  Button,
  Table,
  Heading,
  VStack,
  RadioGroup,
  Text,
} from '@chakra-ui/react';
import ApiClient from '@api/apiClient';
import { Pantry } from 'types/types';
import { RefrigeratedDonation } from '../types/pantryEnums';
import { FloatingAlert } from '@components/floatingAlert';
import { useNavigate } from 'react-router-dom';

const AssignedPantries: React.FC = () => {
  const navigate = useNavigate();
  const [pantries, setPantries] = useState<Pantry[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterRefrigeratorFriendly, setFilterRefrigeratorFriendly] = useState<
    boolean | null
  >(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssignedPantries = async () => {
      try {
        const userId = await ApiClient.getMyId();
        const data = await ApiClient.getVolunteerPantries(userId);
        setPantries(data);
      } catch (error) {
        console.error('Error fetching assigned pantries:', error);
        setAlertMessage('Error fetching assigned pantries');
      }
    };

    fetchAssignedPantries();
  }, []);

  const isRefrigeratorFriendly = (pantry: Pantry): boolean => {
    return (
      pantry.refrigeratedDonation === RefrigeratedDonation.YES ||
      pantry.refrigeratedDonation === RefrigeratedDonation.SOMETIMES
    );
  };

  const filteredPantries = useMemo(() => {
    if (filterRefrigeratorFriendly === null) return pantries;
    return pantries.filter(
      (pantry) => isRefrigeratorFriendly(pantry) === filterRefrigeratorFriendly,
    );
  }, [filterRefrigeratorFriendly, pantries]);

  // Map radio value string to filter state
  const radioValue =
    filterRefrigeratorFriendly === true
      ? 'yes'
      : filterRefrigeratorFriendly === false
      ? 'no'
      : '';

  const handleRadioChange = (value: string) => {
    if (value === 'yes') setFilterRefrigeratorFriendly(true);
    else if (value === 'no') setFilterRefrigeratorFriendly(false);
    else setFilterRefrigeratorFriendly(null);
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
        <FloatingAlert message={alertMessage} status="error" timeout={6000} />
      )}

      <Heading textStyle="h1" color="gray.light" mb={6}>
        Assigned Pantries
      </Heading>

      {/* Filter Button */}
      <Box display="flex" gap={2} mb={6} fontFamily="'Inter', sans-serif">
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
                  value={radioValue}
                  onValueChange={(e: { value: string }) =>
                    handleRadioChange(e.value)
                  }
                  size="sm"
                >
                  <VStack align="stretch" gap={2}>
                    <RadioGroup.Item value="yes">
                      <RadioGroup.ItemHiddenInput />
                      <RadioGroup.ItemIndicator />
                      <RadioGroup.ItemText fontSize="sm">
                        Refrigerator-Friendly Only
                      </RadioGroup.ItemText>
                    </RadioGroup.Item>
                    <RadioGroup.Item value="no">
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
      {filteredPantries.length === 0 ? (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          mt={16}
          gap={2}
        >
          <CircleCheck size={32} color="gray" />
          <Text fontWeight="bold" fontSize="md" color="gray.800">
            No Assigned Pantries
          </Text>
          <Text fontSize="sm" color="gray.500">
            You have no assigned pantries at this time.
          </Text>
        </Box>
      ) : (
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
                pr={12}
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
              <Table.Row key={pantry.pantryId} _hover={{ bg: 'gray.50' }}>
                {/* Pantry Name */}
                <Table.Cell
                  borderRight="1px solid"
                  borderRightColor="neutral.100"
                  px={4}
                  py={3}
                >
                  <Text
                    as="span"
                    fontSize="sm"
                    fontFamily="inter"
                    textDecoration="underline"
                    cursor="pointer"
                    color="gray.800"
                    textStyle="p2"
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
                  <Box display="flex" justifyContent="flex-end" pr={4}>
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
                    color="neutral.500"
                    textStyle="p2"
                    onClick={() => navigate('/landing-page')}
                    fontFamily="inter"
                    fontSize="sm"
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
    </Box>
  );
};

export default AssignedPantries;
