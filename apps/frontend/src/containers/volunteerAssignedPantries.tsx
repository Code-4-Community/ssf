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
  const [selectedPantry, setSelectedPantry] = useState<Pantry | null>(null);

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

  const handlePantryClick = async (pantryId: number) => {
    // TODO: navigate to pantr details page
    try {
      const fullPantryDetails = await ApiClient.getPantry(pantryId);
      setSelectedPantry(fullPantryDetails);
    } catch (error) {
      console.error('Error fetching pantry details:', error);
      alert('Error fetching pantry details: ' + error);
    }
  };

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
                    onClick={() => assignment.pantry && handlePantryClick(assignment.pantry.pantryId)}
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

      {/* Temporary: Show selected pantry details (will be a separate page later) */}
      {selectedPantry && (
        <Box
          mt={8}
          p={6}
          border="1px solid"
          borderColor="gray.200"
          borderRadius="md"
          bg="gray.50"
        >
          <Heading size="md" mb={4}>
            Pantry Information
          </Heading>
          <Text fontSize="sm" color="gray.600" mb={4} fontStyle="italic">
            Note: This is a temporary view. A dedicated pantry details page will be created later.
          </Text>
          <VStack align="stretch" gap={4} fontSize="sm">
            <Box>
              <Text fontWeight="bold" mb={1}>Pantry Name:</Text>
              <Text>{selectedPantry.pantryName}</Text>
            </Box>
            
            <Box>
              <Text fontWeight="bold" mb={1}>Address:</Text>
              <Text>
                {selectedPantry.addressLine1}<br />
                {selectedPantry.addressLine2 && <>{selectedPantry.addressLine2}<br /></>}
                {selectedPantry.addressCity}, {selectedPantry.addressState} {selectedPantry.addressZip}
                {selectedPantry.addressCountry && <><br />{selectedPantry.addressCountry}</>}
              </Text>
            </Box>
            
            <Box>
              <Text fontWeight="bold" mb={1}>Status:</Text>
              <Text>{selectedPantry.status}</Text>
            </Box>
            
            <Box>
              <Text fontWeight="bold" mb={1}>Date Applied:</Text>
              <Text>{new Date(selectedPantry.dateApplied).toLocaleDateString()}</Text>
            </Box>
            
            <Box>
              <Text fontWeight="bold" mb={1}>Approximately how many allergen-avoidant clients does your pantry serve?</Text>
              <Text>{selectedPantry.allergenClients}</Text>
            </Box>
            
            {selectedPantry.restrictions && selectedPantry.restrictions.length > 0 && (
              <Box>
                <Text fontWeight="bold" mb={1}>Which food allergies or other medical dietary restrictions do clients at your pantry report?</Text>
                <Text>{selectedPantry.restrictions.join(', ')}</Text>
              </Box>
            )}
            
            <Box>
              <Text fontWeight="bold" mb={1}>Would you be able to accept refrigerated/frozen donations from us?</Text>
              <Text>{selectedPantry.refrigeratedDonation}</Text>
            </Box>
            
            <Box>
              <Text fontWeight="bold" mb={1}>Are you willing to reserve our food shipments for allergen-avoidant individuals?</Text>
              <Text>{selectedPantry.reserveFoodForAllergic}</Text>
            </Box>
            
            {selectedPantry.reservationExplanation && (
              <Box>
                <Text fontWeight="bold" mb={1}>Reservation Explanation:</Text>
                <Text>{selectedPantry.reservationExplanation}</Text>
              </Box>
            )}
            
            <Box>
              <Text fontWeight="bold" mb={1}>Do you have a dedicated shelf or section of your pantry for allergy-friendly items?</Text>
              <Text>
                {selectedPantry.dedicatedAllergyFriendly 
                  ? 'Yes, we have a dedicated shelf or box' 
                  : 'No, we keep allergy-friendly items throughout the pantry, depending on the type of item'}
              </Text>
            </Box>
            
            {selectedPantry.clientVisitFrequency && (
              <Box>
                <Text fontWeight="bold" mb={1}>How often do allergen-avoidant clients visit your food pantry?</Text>
                <Text>{selectedPantry.clientVisitFrequency}</Text>
              </Box>
            )}
            
            {selectedPantry.identifyAllergensConfidence && (
              <Box>
                <Text fontWeight="bold" mb={1}>Are you confident in identifying the top 9 allergens in an ingredient list?</Text>
                <Text>{selectedPantry.identifyAllergensConfidence}</Text>
              </Box>
            )}
            
            {selectedPantry.serveAllergicChildren && (
              <Box>
                <Text fontWeight="bold" mb={1}>Do you serve allergen-avoidant or food-allergic children at your pantry?</Text>
                <Text>{selectedPantry.serveAllergicChildren}</Text>
              </Box>
            )}
            
            {selectedPantry.activities && selectedPantry.activities.length > 0 && (
              <Box>
                <Text fontWeight="bold" mb={1}>What activities are you open to doing with SSF?</Text>
                <Text>{selectedPantry.activities.join(', ')}</Text>
              </Box>
            )}
            
            {selectedPantry.activitiesComments && (
              <Box>
                <Text fontWeight="bold" mb={1}>Activities Comments:</Text>
                <Text>{selectedPantry.activitiesComments}</Text>
              </Box>
            )}
            
            <Box>
              <Text fontWeight="bold" mb={1}>What types of allergen-free items, if any, do you currently have in stock?</Text>
              <Text>{selectedPantry.itemsInStock}</Text>
            </Box>
            
            <Box>
              <Text fontWeight="bold" mb={1}>Do allergen-avoidant clients at your pantry ever request a greater variety of items or not have enough options?</Text>
              <Text>{selectedPantry.needMoreOptions}</Text>
            </Box>
            
            <Box>
              <Text fontWeight="bold" mb={1}>Would you like to subscribe to our quarterly newsletter?</Text>
              <Text>{selectedPantry.newsletterSubscription ? 'Yes' : 'No'}</Text>
            </Box>
          </VStack>
          <Button
            mt={4}
            size="sm"
            onClick={() => setSelectedPantry(null)}
            variant="outline"
          >
            Close
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default AssignedPantries;