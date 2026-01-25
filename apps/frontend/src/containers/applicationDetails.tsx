import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Center,
  Box,
  Grid,
  GridItem,
  Text,
  Button,
  Heading,
  VStack,
  HStack,
  Spinner,
  Badge,
  Flex,
} from '@chakra-ui/react';
import ApiClient from '@api/apiClient';
import { Pantry } from 'types/types';

type PantryWithShipment = Pantry & {
  shipmentAddressLine1?: string | null;
  shipmentAddressLine2?: string | null;
  shipmentAddressCity?: string | null;
  shipmentAddressState?: string | null;
  shipmentAddressZip?: string | null;
  shipmentAddressCountry?: string | null;
};

const ApplicationDetails: React.FC = () => {
  const { applicationId } = useParams<{ applicationId: string }>();
  const navigate = useNavigate();
  const [application, setApplication] = useState<PantryWithShipment | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatPhone = (phone?: string | null) => {
    if (!phone) return null;
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 10) {
      return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    return phone;
  };

  const fetchApplicationDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      if (!applicationId) {
        setError('Application ID not provided');
        return;
      }
      const data = await ApiClient.getPantry(parseInt(applicationId, 10));
      setApplication(data as PantryWithShipment);
    } catch (err) {
      setError(
        'Error loading application details: ' +
          (err instanceof Error ? err.message : String(err)),
      );
    } finally {
      setLoading(false);
    }
  }, [applicationId]);

  useEffect(() => {
    fetchApplicationDetails();
  }, [fetchApplicationDetails]);

  const handleApprove = async () => {
    if (application) {
      try {
        await ApiClient.updatePantry(application.pantryId, 'approve');
        navigate('/approve-pantries');
      } catch (err) {
        alert('Error approving application: ' + err);
      }
    }
  };

  const handleDeny = async () => {
    if (application) {
      try {
        await ApiClient.updatePantry(application.pantryId, 'deny');
        navigate('/approve-pantries');
      } catch (err) {
        alert('Error denying application: ' + err);
      }
    }
  };

  if (loading) {
    return (
      <Center h="100vh" flexDirection="column">
        <Spinner size="lg" />
        <Text mt={4}>Loading application details...</Text>
      </Center>
    );
  }

  if (error) {
    return (
      <Center h="100vh" flexDirection="column">
        <Text color="red" fontSize="lg" mb={4}>
          {error}
        </Text>
        <Button onClick={() => navigate('/approve-pantries')}>Back to Applications</Button>
      </Center>
    );
  }

  if (!application) {
    return (
      <Center h="100vh" flexDirection="column">
        <Text fontSize="lg" mb={4}>
          Application not found
        </Text>
        <Button onClick={() => navigate('/approve-pantries')}>Back to Applications</Button>
      </Center>
    );
  }

  const pantryUser = application.pantryUser;

  return (
    <Box bg="neutral.50" minH="100vh" p={8}>
      <Box maxW="1200px" mx="auto">
        {/* Page Title */}
        <Heading as="h1" textStyle="h1" color="neutral.600" mb={8}>
          Application Details
        </Heading>

        {/* Main Content Card */}
        <Box bg="white" borderRadius="8px" p={8} boxShadow="sm">
          <VStack align="stretch" gap={8}>
            {/* Application Header */}
            <Box>
              <Heading as="h2" textStyle="h2" mb={2}>
                Application #{application.pantryId}
              </Heading>
              <Text textStyle="p" mb={1}>
                {application.pantryName}
              </Text>
              <Text textStyle="p2" color="neutral.600">
                Applied {new Date(application.dateApplied).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}
              </Text>
            </Box>

            {/* Point of Contact and Shipping Address */}
            <Grid templateColumns="repeat(2, 1fr)" gap={8}>
              <GridItem>
                <Heading as="h3" textStyle="h4" mb={3}>
                  Point of Contact Information
                </Heading>
                <VStack align="stretch" gap={2}>
                  <Text textStyle="p">
                    {pantryUser
                      ? `${pantryUser.firstName} ${pantryUser.lastName}`
                      : application.secondaryContactFirstName &&
                        application.secondaryContactLastName
                      ? `${application.secondaryContactFirstName} ${application.secondaryContactLastName}`
                      : 'N/A'}
                  </Text>
                  <Text textStyle="p">
                    {formatPhone(
                      pantryUser?.phone ?? application.secondaryContactPhone,
                    ) ?? 'N/A'}
                  </Text>
                  <Text textStyle="p">
                    {pantryUser?.email ??
                      application.secondaryContactEmail ??
                      'N/A'}
                  </Text>
                </VStack>
              </GridItem>
              <GridItem>
                <Heading as="h3" textStyle="h4" mb={3}>
                  Shipping Address
                </Heading>
                <VStack align="stretch" gap={1}>
                  <Text textStyle="p">
                    {application.shipmentAddressLine1 ?? 'N/A'},
                  </Text>
                  <Text textStyle="p">
                    {application.shipmentAddressCity ?? 'N/A'},{' '}
                    {application.shipmentAddressState ?? 'N/A'}{' '}
                    {application.shipmentAddressZip ?? ''}
                  </Text>
                  <Text textStyle="p">
                    {application.shipmentAddressCountry === 'US'
                      ? 'United States of America'
                      : application.shipmentAddressCountry ?? 'N/A'}
                  </Text>
                </VStack>
              </GridItem>
            </Grid>

            {/* Pantry Details */}
            <Box>
              <Heading as="h3" textStyle="h4" mb={4}>
                Pantry Details
              </Heading>
              <Grid templateColumns="repeat(2, 1fr)" gap={6}>
                <GridItem>
                  <Text textStyle="p2" fontWeight="600" mb={1}>
                    Name
                  </Text>
                  <Text textStyle="p">{application.pantryName}</Text>
                </GridItem>
                <GridItem>
                  <Text textStyle="p2" fontWeight="600" mb={1}>
                    Approximate # of Clients
                  </Text>
                  <Text textStyle="p">{application.allergenClients}</Text>
                </GridItem>
              </Grid>
            </Box>

            {/* Food Allergies and Restrictions */}
            <Box>
              <Heading as="h3" textStyle="h4" mb={4}>
                Food Allergies and Restrictions
              </Heading>
              <Flex wrap="wrap" gap={2} mb={6}>
                {application.restrictions && application.restrictions.length > 0 ? (
                  application.restrictions.map((restriction, index) => (
                    <Badge
                      key={index}
                      px={3}
                      py={2}
                      bg="neutral.100"
                      color="neutral.900"
                      borderRadius="4px"
                      fontWeight="400"
                      textStyle="p2"
                    >
                      {restriction}
                    </Badge>
                  ))
                ) : (
                  <Text textStyle="p2">None</Text>
                )}
              </Flex>

              <Grid templateColumns="repeat(2, 1fr)" gap={6} mb={6}>
                <GridItem>
                  <Text textStyle="p2" fontWeight="600" mb={1}>
                    Accepts Refrigerated Donations?
                  </Text>
                  <Text textStyle="p">{application.refrigeratedDonation}</Text>
                </GridItem>
                <GridItem>
                  <Text textStyle="p2" fontWeight="600" mb={1}>
                    Willing to Reserve Donations for Allergen-Avoidant Individuals
                  </Text>
                  <Text textStyle="p">{application.reserveFoodForAllergic}</Text>
                </GridItem>
              </Grid>

              {application.reservationExplanation && (
                <Box mb={6}>
                  <Text textStyle="p2" fontWeight="600" mb={1}>
                    Justification
                  </Text>
                  <Text textStyle="p">{application.reservationExplanation}</Text>
                </Box>
              )}

              <Grid templateColumns="repeat(2, 1fr)" gap={6} mb={6}>
                <GridItem>
                  <Text textStyle="p2" fontWeight="600" mb={1}>
                    Dedicated section for allergy-friendly items?
                  </Text>
                  <Text textStyle="p">{application.dedicatedAllergyFriendly ? 'Yes, we have a dedicated shelf or box' : 'No'}</Text>
                </GridItem>
                <GridItem>
                  <Text textStyle="p2" fontWeight="600" mb={1}>
                    How Often Allergen-Avoidant Clients Visit
                  </Text>
                  <Text textStyle="p">{application.clientVisitFrequency ?? 'Not specified'}</Text>
                </GridItem>
              </Grid>

              <Grid templateColumns="repeat(2, 1fr)" gap={6}>
                <GridItem>
                  <Text textStyle="p2" fontWeight="600" mb={1}>
                    Confident in Identifying the Top 9 Allergens
                  </Text>
                  <Text textStyle="p">{application.identifyAllergensConfidence ?? 'Not specified'}</Text>
                </GridItem>
                <GridItem>
                  <Text textStyle="p2" fontWeight="600" mb={1}>
                    Serves Allergen-Avoidant Children
                  </Text>
                  <Text textStyle="p">{application.serveAllergicChildren ?? 'Not specified'}</Text>
                </GridItem>
              </Grid>
            </Box>

            {/* Open to SSF Activities */}
            <Box>
              <Heading as="h3" textStyle="h4" mb={4}>
                Open to SSF Activities
              </Heading>
              <Flex wrap="wrap" gap={2}>
                {application.activities && application.activities.length > 0 ? (
                  application.activities.map((activity, index) => (
                    <Badge
                      key={index}
                      px={3}
                      py={2}
                      bg="neutral.100"
                      color="neutral.900"
                      borderRadius="4px"
                      fontWeight="400"
                      textStyle="p2"
                    >
                      {activity}
                    </Badge>
                  ))
                ) : (
                  <Text textStyle="p2">None</Text>
                )}
              </Flex>
            </Box>

            {/* Comments/Concerns */}
            <Box>
              <Heading as="h3" textStyle="h4" mb={3}>
                Comments/Concerns
              </Heading>
              <Text textStyle="p">{application.activitiesComments || '-'}</Text>
            </Box>

            {/* Allergen-free Items in Stock */}
            <Box>
              <Heading as="h3" textStyle="h4" mb={3}>
                Allergen-free Items in Stock
              </Heading>
              <Text textStyle="p">{application.itemsInStock}</Text>
            </Box>

            {/* Client Requests */}
            <Box>
              <Heading as="h3" textStyle="h4" mb={3}>
                Client Requests
              </Heading>
              <Text textStyle="p">{application.needMoreOptions}</Text>
            </Box>

            {/* Subscribed to Newsletter */}
            <Box>
              <Heading as="h3" textStyle="h4" mb={3}>
                Subscribed to Newsletter
              </Heading>
              <Text textStyle="p">{application.newsletterSubscription ? 'Yes' : 'No'}</Text>
            </Box>

            {/* Action Buttons */}
            <HStack justify="flex-end" gap={4} pt={4}>
              <Button
                variant="outline"
                borderColor="neutral.300"
                color="neutral.900"
                onClick={handleDeny}
                px={6}
              >
                Deny
              </Button>
              <Button
                bg="neutral.900"
                color="white"
                onClick={handleApprove}
                px={6}
                _hover={{ bg: 'neutral.800' }}
              >
                Approve Application
              </Button>
            </HStack>
          </VStack>
        </Box>
      </Box>
    </Box>
  );
};

export default ApplicationDetails;
