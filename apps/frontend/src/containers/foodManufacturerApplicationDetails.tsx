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
import { FoodManufacturer } from 'types/types';
import { formatDate, formatPhone } from '@utils/utils';
import { TagGroup } from '@components/forms/tagGroup';
import { FileX, TriangleAlert, WifiOff } from 'lucide-react';
import { AxiosError } from 'axios';
import { FloatingAlert } from '@components/floatingAlert';
import { useAlert } from '../hooks/alert';
import ConfirmFoodManufacturerDecisionModal from '@components/forms/confirmFoodManufacturerDecisionModal';
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
              <Link to={ROUTES.APPROVE_FOOD_MANUFACTURERS}>
                Return to applications
              </Link>
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
};

const FoodManufacturerApplicationDetails: React.FC = () => {
  const { applicationId } = useParams<{ applicationId: string }>();
  const navigate = useNavigate();
  const [application, setApplication] = useState<FoodManufacturer | null>(null);
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
      const data = await ApiClient.getFoodManufacturer(
        parseInt(applicationId, 10),
      );
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
        await ApiClient.updateFoodManufacturer(
          application.foodManufacturerId,
          'approve',
        );
        navigate(
          ROUTES.APPROVE_FOOD_MANUFACTURERS +
            '?action=approved&name=' +
            application.foodManufacturerName,
        );
      } catch {
        setAlertMessage('Error approving application');
      }
    }
  };

  const handleDeny = async () => {
    if (application) {
      try {
        await ApiClient.updateFoodManufacturer(
          application.foodManufacturerId,
          'deny',
        );
        navigate(
          ROUTES.APPROVE_FOOD_MANUFACTURERS +
            '?action=denied&name=' +
            application.foodManufacturerName,
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

  const rep = application.foodManufacturerRepresentative;
  const hasSecondaryContact =
    application.secondaryContactFirstName ||
    application.secondaryContactLastName ||
    application.secondaryContactEmail ||
    application.secondaryContactPhone;

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
            {/* Header */}
            <Box>
              <Heading fontSize="18px" fontWeight={600} mb={2}>
                Application #{application.foodManufacturerId}
              </Heading>
              <Text textStyle="p2" color="gray.dark" mb={1}>
                {application.foodManufacturerName}
              </Text>
              <Text textStyle="p3" color="neutral.600">
                Applied {formatDate(application.dateApplied)}
              </Text>
            </Box>

            {/* Point of Contact Information */}
            <Box>
              <Heading {...sectionHeaderStyles} mb={4}>
                Point of Contact Information
              </Heading>
              <Grid templateColumns="repeat(2, 1fr)" gap={8}>
                <GridItem>
                  <Text {...fieldHeaderStyles}>Primary Representative</Text>
                  <Text {...fieldContentStyles}>
                    {rep.firstName} {rep.lastName}
                  </Text>
                  <Text {...fieldContentStyles}>{formatPhone(rep.phone)}</Text>
                  <Text {...fieldContentStyles}>{rep.email}</Text>
                </GridItem>

                {hasSecondaryContact && (
                  <GridItem>
                    <Text {...fieldHeaderStyles}>Secondary Contact</Text>
                    {(application.secondaryContactFirstName ||
                      application.secondaryContactLastName) && (
                      <Text {...fieldContentStyles}>
                        {application.secondaryContactFirstName}{' '}
                        {application.secondaryContactLastName}
                      </Text>
                    )}
                    {application.secondaryContactPhone && (
                      <Text {...fieldContentStyles}>
                        {formatPhone(application.secondaryContactPhone)}
                      </Text>
                    )}
                    {application.secondaryContactEmail && (
                      <Text {...fieldContentStyles}>
                        {application.secondaryContactEmail}
                      </Text>
                    )}
                  </GridItem>
                )}
              </Grid>
            </Box>

            {/* Food Manufacturer Details */}
            <Box>
              <Heading {...sectionHeaderStyles} mb={6}>
                Food Manufacturer Details
              </Heading>
              <VStack align="stretch" gap={6}>
                <Grid templateColumns="repeat(2, 1fr)" gap={6}>
                  <GridItem>
                    <Text {...fieldHeaderStyles}>Name</Text>
                    <Text {...fieldContentStyles}>
                      {application.foodManufacturerName}
                    </Text>
                  </GridItem>
                  <GridItem>
                    <Text {...fieldHeaderStyles}>Website</Text>
                    <Text {...fieldContentStyles}>
                      {application.foodManufacturerWebsite}
                    </Text>
                  </GridItem>
                  {application.manufacturerAttribute && (
                    <GridItem>
                      <Text {...fieldHeaderStyles}>Manufacturer Attribute</Text>
                      <Text {...fieldContentStyles}>
                        {application.manufacturerAttribute}
                      </Text>
                    </GridItem>
                  )}
                </Grid>

                <Box>
                  <Text {...fieldHeaderStyles}>Unlisted Product Allergens</Text>
                  {application.unlistedProductAllergens.length > 0 ? (
                    <TagGroup values={application.unlistedProductAllergens} />
                  ) : (
                    <Text {...fieldContentStyles}>None</Text>
                  )}
                </Box>

                <Box>
                  <Text {...fieldHeaderStyles}>
                    Allergens Facility is Free Of
                  </Text>
                  {application.facilityFreeAllergens.length > 0 ? (
                    <TagGroup values={application.facilityFreeAllergens} />
                  ) : (
                    <Text {...fieldContentStyles}>None</Text>
                  )}
                </Box>

                <Grid templateColumns="repeat(2, 1fr)" gap={6}>
                  <GridItem>
                    <Text {...fieldHeaderStyles}>
                      Products are Gluten-Free?
                    </Text>
                    <Text {...fieldContentStyles}>
                      {application.productsGlutenFree ? 'Yes' : 'No'}
                    </Text>
                  </GridItem>
                  <GridItem>
                    <Text {...fieldHeaderStyles}>
                      Products Contain Sulfites?
                    </Text>
                    <Text {...fieldContentStyles}>
                      {application.productsContainSulfites ? 'Yes' : 'No'}
                    </Text>
                  </GridItem>
                  <GridItem>
                    <Text {...fieldHeaderStyles}>In-Kind Donations?</Text>
                    <Text {...fieldContentStyles}>
                      {application.inKindDonations ? 'Yes' : 'No'}
                    </Text>
                  </GridItem>
                  <GridItem>
                    <Text {...fieldHeaderStyles}>Donate Wasted Food?</Text>
                    <Text {...fieldContentStyles}>
                      {application.donateWastedFood}
                    </Text>
                  </GridItem>
                </Grid>

                <Box>
                  <Text {...fieldHeaderStyles}>
                    Sustainable Products Explanation
                  </Text>
                  <Text {...fieldContentStyles}>
                    {application.productsSustainableExplanation || '-'}
                  </Text>
                </Box>

                <Box>
                  <Text {...fieldHeaderStyles}>Additional Comments</Text>
                  <Text {...fieldContentStyles}>
                    {application.additionalComments || '-'}
                  </Text>
                </Box>

                <Box>
                  <Text {...fieldHeaderStyles}>Subscribed to Newsletter</Text>
                  <Text {...fieldContentStyles}>
                    {application.newsletterSubscription ? 'Yes' : 'No'}
                  </Text>
                </Box>
              </VStack>
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

              <ConfirmFoodManufacturerDecisionModal
                isOpen={showApproveModal}
                onClose={() => setShowApproveModal(false)}
                onConfirm={handleApprove}
                decision="approve"
                foodManufacturerName={application.foodManufacturerName}
                dateApplied={formatDate(application.dateApplied)}
              />

              <ConfirmFoodManufacturerDecisionModal
                isOpen={showDenyModal}
                onClose={() => setShowDenyModal(false)}
                onConfirm={handleDeny}
                decision="deny"
                foodManufacturerName={application.foodManufacturerName}
                dateApplied={formatDate(application.dateApplied)}
              />
            </HStack>
          </VStack>
        </Box>
      </Box>
    </Box>
  );
};

export default FoodManufacturerApplicationDetails;
