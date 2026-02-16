import React, { useState, useEffect } from 'react';
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
  const [filteredAssignments, setFilteredAssignments] = useState<Assignments[]>([]);
  const [pantryDetails, setPantryDetails] = useState<Map<number, Pantry>>(new Map());
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterRefrigeratorFriendly, setFilterRefrigeratorFriendly] = useState<boolean | null>(null);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {

        const data = await ApiClient.getAllAssignments() as Assignments[];
        setAssignments(data);
        setFilteredAssignments(data);
        
        const detailsMap = new Map<number, Pantry>();
        await Promise.all(
          data
            .filter(assignment => assignment.pantry)
            .map(async (assignment) => {
              try {
                const pantry = await ApiClient.getPantry(assignment.pantry!.pantryId);
                detailsMap.set(assignment.pantry!.pantryId, pantry);
              } catch (error) {
                console.error(`Error fetching pantry ${assignment.pantry!.pantryId}:`, error);
              }
            })
        );
        setPantryDetails(detailsMap);
      } catch (error) {
        console.error('Error fetching assignments:', error);
        alert('Error fetching assigned pantries: ' + error);
      }
    };
    
    fetchAssignments();
  }, []);

  useEffect(() => {

    let filtered = [...assignments];
    
    if (filterRefrigeratorFriendly !== null) {
      filtered = filtered.filter(assignment => {
        if (!assignment.pantry) return false;
        const pantry = pantryDetails.get(assignment.pantry.pantryId);
        if (!pantry) return true;
        const isRefrigeratorFriendlyValue = 
          pantry.refrigeratedDonation === RefrigeratedDonation.YES || 
          pantry.refrigeratedDonation === RefrigeratedDonation.SOMETIMES;
        return isRefrigeratorFriendlyValue === filterRefrigeratorFriendly;
      });
    }
    
    setFilteredAssignments(filtered);
  }, [filterRefrigeratorFriendly, assignments, pantryDetails]);


  const handleViewOrders = (pantryId: number) => {
    // TODO: Redirect to Order Management page when it's created
    console.log('View orders for pantry:', pantryId);
  };

  const isRefrigeratorFriendly = (pantryId: number): boolean => {
    const pantry = pantryDetails.get(pantryId);
    if (!pantry) return false;
    return pantry.refrigeratedDonation === RefrigeratedDonation.YES || 
           pantry.refrigeratedDonation === RefrigeratedDonation.SOMETIMES;
  };

  const getRefrigeratorFriendlyText = (pantryId: number): string => {
    const pantry = pantryDetails.get(pantryId);
    if (!pantry) return 'Loading...';
    if (pantry.refrigeratedDonation === RefrigeratedDonation.YES || 
        pantry.refrigeratedDonation === RefrigeratedDonation.SOMETIMES) {
      return 'Refrigerator-Friendly';
    }
    return 'Not Refrigerator-Friendly';
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
                    <Text fontSize="sm" cursor="pointer" onClick={() => setFilterRefrigeratorFriendly(filterRefrigeratorFriendly === true ? null : true)}>
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
                    <Text fontSize="sm" cursor="pointer" onClick={() => setFilterRefrigeratorFriendly(filterRefrigeratorFriendly === false ? null : false)}>
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
          {filteredAssignments.map((assignment) => {

            if (!assignment.pantry) return null;
            
            return (
              <Table.Row
                key={assignment.assignmentId}
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
                    onClick={() => assignment.pantry}
                    fontFamily="inter"
                  >
                    {assignment.pantry.pantryName}
                  </Button>
                </Table.Cell>
                <Table.Cell
                  textStyle="p2"
                  borderRight="1px solid"
                  borderRightColor="neutral.100"
                  color="neutral.700"
                >
                  <Box
                    bg={assignment.pantry && isRefrigeratorFriendly(assignment.pantry.pantryId) ? 'gray.100' : 'orange.50'}
                    px={3}
                    py={1}
                    borderRadius="md"
                    display="inline-block"
                    fontSize="sm"
                    fontFamily="inter"
                  >
                    {assignment.pantry ? getRefrigeratorFriendlyText(assignment.pantry.pantryId) : 'N/A'}
                  </Box>
                </Table.Cell>
                <Table.Cell textStyle="p2" textAlign="center">
                  <Button
                    variant="plain"
                    textDecoration="underline"
                    color="blue.600"
                    onClick={() => assignment.pantry && handleViewOrders(assignment.pantry.pantryId)}
                    fontFamily="inter"
                    fontSize="sm"
                  >
                    View Orders
                  </Button>
                </Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table.Root>
    </Box>
  );
};

export default AssignedPantries;