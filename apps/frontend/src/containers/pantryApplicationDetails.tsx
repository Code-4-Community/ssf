import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Grid,
  GridItem,
  Text,
  Button,
  Heading,
  VStack,
  HStack,
  Spinner,
} from '@chakra-ui/react';
import ApiClient from '@api/apiClient';
import { ApplicationStatus, PantryWithUser } from 'types/types';
import { formatDate, formatPhone } from '@utils/utils';
import { TagGroup } from '@components/forms/tagGroup';
import { FileX, TriangleAlert, WifiOff } from 'lucide-react';
import { AxiosError } from 'axios';
import { FloatingAlert } from '@components/floatingAlert';
import ConfirmPantryDecisionModal from '@components/forms/confirmPantryDecisionModal';
import { useAlert } from '../hooks/alert';
import { ROUTES } from '../routes';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  isLoading?: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  subtitle,
  isLoading = false,
}) => {
  return (
    <Box minH="100vh" p={8} mb={8}>
      <Box maxW="1200px" mx="auto">
        <Heading as="h1" textStyle="h1" color="gray.light" mb={8}>
          Application Details
        </Heading>

        <Box
          bg="white"
          borderRadius="6px"
          border="1px solid"
          borderColor="neutral.100"
          p={64}
          boxShadow="sm"
          display="flex"
          alignItems="center"
          flexDirection="column"
          justifyContent="center"
          textAlign="center"
          gap={4}
        >
          {icon}
          <Heading textStyle="p" fontWeight={600}>
            {title}
          </Heading>
          {subtitle && (
            <Text textStyle="p2" color="neutral.800">
              {subtitle}
            </Text>
          )}
          {!isLoading && (
            <Button
              bg="blue.hover"
              color="white"
              px={6}
              _hover={{ bg: 'neutral.800' }}
              textStyle="p2"
              fontWeight={600}
            >
              <Link to={ROUTES.APPROVE_PANTRIES}>Return to applications</Link>
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
};

const PantryApplicationDetails: React.FC = () => {
  const { applicationId } = useParams<{ applicationId: string }>();
  const navigate = useNavigate();
  const [application, setApplication] = useState<PantryWithUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{
    type: 'network' | 'not_found' | 'invalid' | null;
    message: string;
  }>({
    type: null,
    message: '',
  });
  const [alertState, setAlertMessage] = useAlert();
  const [showApproveModal, setShowApproveModal] = useState<boolean>(false);
  const [showDenyModal, setShowDenyModal] = useState<boolean>(false);

  const fieldContentStyles = {
    textStyle: 'p2',
    color: 'gray.light',
    lineHeight: '1.2',
  };

  const headerStyles = {
    textStyle: 'p2',
    color: 'neutral.800',
  };

  const sectionHeaderStyles = {
    ...headerStyles,
    fontWeight: 600,
  };

  const fieldHeaderStyles = {
    ...headerStyles,
    fontWeight: 500,
    mb: 1,
  };

  const fetchApplicationDetails = useCallback(async () => {
    try {
      setLoading(true);
      if (!applicationId) {
        setError({ type: 'invalid', message: 'Application ID not provided.' });
        return;
      } else if (isNaN(parseInt(applicationId, 10))) {
        setError({
          type: 'invalid',
          message: 'Application ID is not a number.',
        });
      }
      const data = await ApiClient.getPantry(parseInt(applicationId, 10));
      if (!data) {
        setError({
          type: 'not_found',
          message: 'Application not found.',
        });
      }
      setApplication(data);
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        if (err.response?.status !== 404 && err.response?.status !== 400) {
          setError({
            type: 'network',
            message: 'Could not load application details.',
          });
        }
      }
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
        navigate(
          ROUTES.APPROVE_PANTRIES +
            '?action=' +
            ApplicationStatus.APPROVED +
            '&name=' +
            application.pantryName,
        );
      } catch {
        setAlertMessage('Error approving application');
      }
    }
  };

  const handleDeny = async () => {
    if (application) {
      try {
        await ApiClient.updatePantry(application.pantryId, 'deny');
        navigate(
          ROUTES.APPROVE_PANTRIES +
            '?action=' +
            ApplicationStatus.DENIED +
            '&name=' +
            application.pantryName,
        );
      } catch {
        setAlertMessage('Error denying application');
      }
    }
  };

  if (loading) {
    return (
      <EmptyState
        icon={<Spinner />}
        title="Loading application details..."
        isLoading={true}
      />
    );
  }

  if (error.message || !application) {
    const getIcon = () => {
      switch (error.type) {
        case 'network':
          return <WifiOff />;
        case 'not_found':
          return <FileX />;
        default:
          return <TriangleAlert />;
      }
    };

    return (
      <EmptyState
        icon={getIcon()}
        title={error.message}
        subtitle={
          error.type === 'network' ? 'Please try again later.' : undefined
        }
      />
    );
  }

  const pantryUser = application.pantryUser;

  return (
    <Box minH="100vh" p={8} mb={8}>
      <Box maxW="1200px" mx="auto">
        <Heading as="h1" textStyle="h1" color="gray.light" mb={8}>
          Application Details
        </Heading>

        {alertState && (
          <FloatingAlert
            key={alertState.id}
            message={alertState.message}
            status="error"
            timeout={6000}
          />
        )}

        <Box
          bg="white"
          borderRadius="6px"
          border="1px solid"
          borderColor="neutral.100"
          p={6}
          boxShadow="sm"
        >
          <VStack align="stretch" gap={8}>
            <Box>
              <Heading fontSize="18px" fontWeight={600} mb={2}>
                Application #{application.pantryId}
              </Heading>
              <Text textStyle="p2" color="gray.dark" mb={1}>
                {application.pantryName}
              </Text>
              <Text textStyle="p3" color="neutral.600">
                Applied {formatDate(application.dateApplied)}
              </Text>
            </Box>

            <Grid templateColumns="repeat(2, 1fr)" gap={8}>
              <GridItem>
                <Heading {...sectionHeaderStyles} mb={2}>
                  Point of Contact Information
                </Heading>
                <Text {...fieldContentStyles}>
                  {pantryUser.firstName} {pantryUser.lastName}
                </Text>
                <Text {...fieldContentStyles}>
                  {formatPhone(pantryUser.phone)}
                </Text>
                <Text {...fieldContentStyles}>{pantryUser.email}</Text>
              </GridItem>
              <GridItem>
                <Heading {...sectionHeaderStyles} mb={2}>
                  Shipping Address
                </Heading>
                <Text {...fieldContentStyles}>
                  {application.shipmentAddressLine1}
                  {application.shipmentAddressLine2 &&
                    `, ${application.shipmentAddressLine2}`}
                </Text>
                <Text {...fieldContentStyles}>
                  {application.shipmentAddressCity},{' '}
                  {application.shipmentAddressState}{' '}
                  {application.shipmentAddressZip}
                </Text>
                <Text {...fieldContentStyles}>
                  {application.shipmentAddressCountry === 'US'
                    ? 'United States of America'
                    : application.shipmentAddressCountry ?? ''}
                </Text>
              </GridItem>
            </Grid>

            <Box>
              <Heading {...sectionHeaderStyles} mb={6}>
                Pantry Details
              </Heading>
              <Grid templateColumns="repeat(2, 1fr)" gap={6}>
                <GridItem>
                  <Text {...fieldHeaderStyles}>Name</Text>
                  <Text {...fieldContentStyles}>{application.pantryName}</Text>
                </GridItem>
                <GridItem>
                  <Text {...fieldHeaderStyles}>Approximate # of Clients</Text>
                  <Text {...fieldContentStyles}>
                    {application.allergenClients}
                  </Text>
                </GridItem>
              </Grid>
            </Box>

            <Box>
              <Heading {...fieldHeaderStyles}>
                Food Allergies and Restrictions
              </Heading>
              {application.restrictions &&
              application.restrictions.length > 0 ? (
                <TagGroup values={application.restrictions} />
              ) : (
                <Text {...fieldContentStyles}>None</Text>
              )}
            </Box>

            <Grid templateColumns="1fr 2fr">
              <GridItem>
                <Text {...fieldHeaderStyles}>
                  Accepts Refrigerated Donations?
                </Text>
                <Text {...fieldContentStyles}>
                  {application.refrigeratedDonation}
                </Text>
              </GridItem>
              <GridItem>
                <Text {...fieldHeaderStyles}>
                  Willing to Reserve Donations for Allergen-Avoidant Individuals
                </Text>
                <Text {...fieldContentStyles}>
                  {application.reserveFoodForAllergic}
                </Text>
              </GridItem>
            </Grid>

            {application.reservationExplanation && (
              <Box>
                <Text {...fieldHeaderStyles}>Justification</Text>
                <Text {...fieldContentStyles}>
                  {application.reservationExplanation}
                </Text>
              </Box>
            )}

            <Grid templateColumns="repeat(2, 1fr)" gap={6}>
              <GridItem>
                <Text {...fieldHeaderStyles}>
                  Dedicated section for allergy-friendly items?
                </Text>
                <Text {...fieldContentStyles}>
                  {application.dedicatedAllergyFriendly
                    ? 'Yes, we have a dedicated shelf or box'
                    : 'No'}
                </Text>
              </GridItem>
              <GridItem>
                <Text {...fieldHeaderStyles}>
                  How Often Allergen-Avoidant Clients Visit
                </Text>
                <Text {...fieldContentStyles}>
                  {application.clientVisitFrequency ?? 'Not specified'}
                </Text>
              </GridItem>
            </Grid>

            <Grid templateColumns="repeat(2, 1fr)" gap={6}>
              <GridItem>
                <Text {...fieldHeaderStyles}>
                  Confidence in Identifying the Top 9 Allergens
                </Text>
                <Text {...fieldContentStyles}>
                  {application.identifyAllergensConfidence ?? 'Not specified'}
                </Text>
              </GridItem>
              <GridItem>
                <Text {...fieldHeaderStyles}>
                  Serves Allergen-Avoidant Children
                </Text>
                <Text {...fieldContentStyles}>
                  {application.serveAllergicChildren ?? 'Not specified'}
                </Text>
              </GridItem>
            </Grid>

            <Box>
              <Heading {...fieldHeaderStyles}>Open to SSF Activities</Heading>
              {application.activities && application.activities.length > 0 ? (
                <TagGroup values={application.activities} />
              ) : (
                <Text {...fieldContentStyles}>None</Text>
              )}
            </Box>

            <Box>
              <Heading {...fieldHeaderStyles}>Comments/Concerns</Heading>
              <Text {...fieldContentStyles}>
                {application.activitiesComments || '-'}
              </Text>
            </Box>

            <Box>
              <Heading {...fieldHeaderStyles}>
                Allergen-free Items in Stock
              </Heading>
              <Text {...fieldContentStyles}>{application.itemsInStock}</Text>
            </Box>

            <Box>
              <Heading {...fieldHeaderStyles}>Client Requests</Heading>
              <Text {...fieldContentStyles}>{application.needMoreOptions}</Text>
            </Box>

            <Box>
              <Heading {...fieldHeaderStyles}>Subscribed to Newsletter</Heading>
              <Text {...fieldContentStyles}>
                {application.newsletterSubscription ? 'Yes' : 'No'}
              </Text>
            </Box>

            <HStack justify="flex-end" gap={2}>
              <Button
                variant="outline"
                borderColor="neutral.200"
                color="neutral.800"
                onClick={() => setShowDenyModal(true)}
                px={4}
                textStyle="p2"
                fontWeight={600}
              >
                Deny
              </Button>
              <Button
                bg="blue.hover"
                color="white"
                onClick={() => setShowApproveModal(true)}
                px={4}
                _hover={{ bg: 'neutral.800' }}
                textStyle="p2"
                fontWeight={600}
              >
                Approve Application
              </Button>

              <ConfirmPantryDecisionModal
                isOpen={showApproveModal}
                onClose={() => setShowApproveModal(false)}
                onConfirm={handleApprove}
                decision="approve"
                pantryName={application.pantryName}
                dateApplied={formatDate(application.dateApplied)}
              />

              <ConfirmPantryDecisionModal
                isOpen={showDenyModal}
                onClose={() => setShowDenyModal(false)}
                onConfirm={handleDeny}
                decision="deny"
                pantryName={application.pantryName}
                dateApplied={formatDate(application.dateApplied)}
              />
            </HStack>
          </VStack>
        </Box>
      </Box>
    </Box>
  );
};

export default PantryApplicationDetails;
