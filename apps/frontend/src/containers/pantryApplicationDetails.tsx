import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate, Link, useMatch } from 'react-router-dom';
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
import { AlertStatus, ApplicationStatus, PantryWithUser } from '../types/types';
import { formatDate, formatPhone } from '@utils/utils';
import { TagGroup } from '@components/forms/tagGroup';
import { TriangleAlert } from 'lucide-react';
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
  const { applicationId, pantryId } = useParams<{
    applicationId?: string;
    pantryId?: string;
  }>();

  const id = applicationId ?? pantryId;

  const isApplicationMode = useMatch(ROUTES.PANTRY_APPLICATION_DETAILS);

  const navigate = useNavigate();
  const [application, setApplication] = useState<PantryWithUser | null>(null);
  const [loading, setLoading] = useState(true);
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
      if (!id) {
        setAlertMessage('Application ID not provided.', AlertStatus.ERROR);
        return;
      } else if (isNaN(parseInt(id, 10))) {
        setAlertMessage('Application ID is not a number.', AlertStatus.ERROR);
      }
      const data = await ApiClient.getPantry(parseInt(id, 10));
      if (!data) {
        setAlertMessage('Application not found.', AlertStatus.ERROR);
      }
      setApplication(data);
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        if (err.response?.status !== 404 && err.response?.status !== 400) {
          setAlertMessage(
            'Could not load application details.',
            AlertStatus.ERROR,
          );
        }
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

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
        setAlertMessage('Error approving application', AlertStatus.ERROR);
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
        setAlertMessage('Error denying application', AlertStatus.ERROR);
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

  if (alertState?.message || !application) {
    return (
      <EmptyState
        icon={<TriangleAlert />}
        title={alertState?.message ?? 'Application not found.'}
      />
    );
  }

  const pantryUser = application.pantryUser;

  return (
    <Box minH="100vh" p={8} mb={8}>
      <Box maxW="1200px" mx="auto">
        <Heading as="h1" textStyle="h1" color="gray.light" mb={8}>
          {isApplicationMode ? 'Application Details' : 'Pantry Details'}
        </Heading>

        {alertState && (
          <FloatingAlert
            key={alertState.id}
            message={alertState.message}
            status={alertState.status}
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
              {isApplicationMode ? (
                <>
                  <Heading fontSize="18px" fontWeight={600} mb={2}>
                    Application #{application.pantryId}
                  </Heading>
                  <Text textStyle="p2" color="gray.dark" mb={1}>
                    {application.pantryName}
                  </Text>
                  <Text textStyle="p3" color="neutral.600">
                    Applied {formatDate(application.dateApplied)}
                  </Text>
                </>
              ) : (
                <Heading fontSize="18px" fontWeight={600} mb={-4}>
                  {application.pantryName}
                </Heading>
              )}
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
                  {formatPhone(pantryUser.phone) || '-'}
                </Text>
                <Text {...fieldContentStyles}>{pantryUser.email}</Text>
              </GridItem>
              <GridItem>
                <Heading {...sectionHeaderStyles} mb={2}>
                  Secondary Point of Contact
                </Heading>
                <Text {...fieldContentStyles}>
                  {application.secondaryContactFirstName ||
                  application.secondaryContactLastName
                    ? `${application.secondaryContactFirstName ?? ''} ${
                        application.secondaryContactLastName ?? ''
                      }`.trim()
                    : '-'}
                </Text>
                <Text {...fieldContentStyles}>
                  {formatPhone(application.secondaryContactPhone) || '-'}
                </Text>
                <Text {...fieldContentStyles}>
                  {application.secondaryContactEmail || '-'}
                </Text>
              </GridItem>
            </Grid>

            <Grid templateColumns="repeat(2, 1fr)" gap={6}>
              <GridItem>
                <Text {...fieldHeaderStyles}>
                  Has a contact who can regularly respond to SSF emails?
                </Text>
                <Text {...fieldContentStyles}>
                  {application.hasEmailContact ? 'Yes' : 'No'}
                </Text>
              </GridItem>
              <GridItem>
                <Text {...fieldHeaderStyles}>Other email contact details</Text>
                <Text {...fieldContentStyles}>
                  {application.emailContactOther || '-'}
                </Text>
              </GridItem>
            </Grid>

            <Grid templateColumns="repeat(2, 1fr)" gap={8}>
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
                    : application.shipmentAddressCountry ?? '-'}
                </Text>
              </GridItem>
              <GridItem>
                <Heading {...sectionHeaderStyles} mb={2}>
                  Mailing Address
                </Heading>
                <Text {...fieldContentStyles}>
                  {application.mailingAddressLine1}
                  {application.mailingAddressLine2 &&
                    `, ${application.mailingAddressLine2}`}
                </Text>
                <Text {...fieldContentStyles}>
                  {application.mailingAddressCity},{' '}
                  {application.mailingAddressState}{' '}
                  {application.mailingAddressZip}
                </Text>
                <Text {...fieldContentStyles}>
                  {application.mailingAddressCountry === 'US'
                    ? 'United States of America'
                    : application.mailingAddressCountry ?? '-'}
                </Text>
              </GridItem>
            </Grid>

            <Box>
              <Heading {...sectionHeaderStyles} mb={6}>
                Delivery Preferences
              </Heading>
              <Grid templateColumns="repeat(2, 1fr)" gap={6}>
                <GridItem>
                  <Text {...fieldHeaderStyles}>
                    Accepts food deliveries during standard business hours
                    (Mon–Fri)?
                  </Text>
                  <Text {...fieldContentStyles}>
                    {application.acceptFoodDeliveries ? 'Yes' : 'No'}
                  </Text>
                </GridItem>
                <GridItem>
                  <Text {...fieldHeaderStyles}>
                    Delivery window restrictions
                  </Text>
                  <Text {...fieldContentStyles}>
                    {application.deliveryWindowInstructions || '-'}
                  </Text>
                </GridItem>
              </Grid>
            </Box>

            <Box>
              <Heading {...sectionHeaderStyles} mb={6}>
                Pantry Details
              </Heading>
              <Grid templateColumns="repeat(2, 1fr)" gap={6}>
                <GridItem>
                  <Text {...fieldHeaderStyles}>Pantry Name</Text>
                  <Text {...fieldContentStyles}>{application.pantryName}</Text>
                </GridItem>
                <GridItem>
                  <Text {...fieldHeaderStyles}>
                    Clients with food allergies or adverse reactions served
                  </Text>
                  <Text {...fieldContentStyles}>
                    {application.allergenClients || '-'}
                  </Text>
                </GridItem>
              </Grid>
            </Box>

            <Box>
              <Heading {...fieldHeaderStyles}>
                Food allergies / dietary restrictions clients report
              </Heading>
              {application.restrictions &&
              application.restrictions.length > 0 ? (
                <TagGroup values={application.restrictions} />
              ) : (
                <Text {...fieldContentStyles}>-</Text>
              )}
            </Box>

            <Grid templateColumns="repeat(2, 1fr)" gap={6}>
              <GridItem>
                <Text {...fieldHeaderStyles}>
                  Able to accept frozen/refrigerated donations?
                </Text>
                <Text {...fieldContentStyles}>
                  {application.refrigeratedDonation || '-'}
                </Text>
              </GridItem>
              <GridItem>
                <Text {...fieldHeaderStyles}>
                  Dedicated shelf/section for allergen-friendly items?
                </Text>
                <Text {...fieldContentStyles}>
                  {application.dedicatedAllergyFriendly || '-'}
                </Text>
              </GridItem>
            </Grid>

            <Grid templateColumns="repeat(2, 1fr)" gap={6}>
              <GridItem>
                <Text {...fieldHeaderStyles}>
                  Willing to reserve food shipments for allergen-avoidant
                  individuals?
                </Text>
                <Text {...fieldContentStyles}>
                  {application.reserveFoodForAllergic || '-'}
                </Text>
              </GridItem>
              <GridItem>
                <Text {...fieldHeaderStyles}>
                  How allergen-friendly foods will reach allergic clients
                </Text>
                <Text {...fieldContentStyles}>
                  {application.reservationExplanation || '-'}
                </Text>
              </GridItem>
            </Grid>

            <Grid templateColumns="repeat(2, 1fr)" gap={6}>
              <GridItem>
                <Text {...fieldHeaderStyles}>
                  How often allergen-avoidant clients visit
                </Text>
                <Text {...fieldContentStyles}>
                  {application.clientVisitFrequency || '-'}
                </Text>
              </GridItem>
              <GridItem>
                <Text {...fieldHeaderStyles}>
                  Serves allergen-avoidant children?
                </Text>
                <Text {...fieldContentStyles}>
                  {application.serveAllergicChildren || '-'}
                </Text>
              </GridItem>
            </Grid>

            <Box>
              <Heading {...fieldHeaderStyles}>
                Languages allergen-avoidant clients speak
              </Heading>
              {application.languages && application.languages.length > 0 ? (
                <TagGroup values={application.languages} />
              ) : (
                <Text {...fieldContentStyles}>-</Text>
              )}
            </Box>

            <Box>
              <Heading {...fieldHeaderStyles}>
                Activities open to doing with SSF
              </Heading>
              {application.activities && application.activities.length > 0 ? (
                <TagGroup values={application.activities} />
              ) : (
                <Text {...fieldContentStyles}>-</Text>
              )}
            </Box>

            <Box>
              <Heading {...fieldHeaderStyles}>
                Comments about activities
              </Heading>
              <Text {...fieldContentStyles}>
                {application.activitiesComments || '-'}
              </Text>
            </Box>

            <Box>
              <Heading {...fieldHeaderStyles}>
                Allergen-free items currently in stock
              </Heading>
              <Text {...fieldContentStyles}>
                {application.itemsInStock || '-'}
              </Text>
            </Box>

            <Box>
              <Heading {...fieldHeaderStyles}>
                Have clients requested more food options?
              </Heading>
              <Text {...fieldContentStyles}>
                {application.needMoreOptions || '-'}
              </Text>
            </Box>

            {isApplicationMode && (
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
            )}
          </VStack>
        </Box>
      </Box>
    </Box>
  );
};

export default PantryApplicationDetails;
