import React from 'react';
import { Box, Button, Text } from '@chakra-ui/react';
import { CircleCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PageEmptyStateProps {
  entity?: string;
  subtitle?: string;
  primaryButtonText?: string;
  primaryButtonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
}

const PageEmptyState: React.FC<PageEmptyStateProps> = ({
  entity,
  subtitle,
  primaryButtonText,
  primaryButtonLink,
  secondaryButtonText,
  secondaryButtonLink,
}) => {
  const navigate = useNavigate();
  const message = subtitle ?? `You have no ${entity} at this time`;

  const hasPrimaryButton = !!(primaryButtonText && primaryButtonLink);
  const hasSecondaryButton = !!(secondaryButtonText && secondaryButtonLink);

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      textAlign="center"
      py={10}
      gap={2}
    >
      <Box mb={2}>
        <CircleCheck size={24} color="var(--chakra-colors-neutral-800)" />
      </Box>
      <Text fontWeight="600" textStyle="p" color="neutral.800">
        No {entity}
      </Text>
      <Text textStyle="p2" color="neutral.700" fontWeight="400">
        {message}
      </Text>
      {(hasPrimaryButton || hasSecondaryButton) && (
        <Box display="flex" gap={3} mt={4}>
          {primaryButtonText && primaryButtonLink && (
            <Button
              size="sm"
              bg="neutral.700"
              color="white"
              _hover={{ bg: 'neutral.800' }}
              onClick={() => navigate(primaryButtonLink)}
            >
              {primaryButtonText}
            </Button>
          )}
          {secondaryButtonText && secondaryButtonLink && (
            <Button
              size="sm"
              variant="outline"
              borderColor="neutral.200"
              color="neutral.700"
              _hover={{ bg: 'neutral.50' }}
              onClick={() => navigate(secondaryButtonLink)}
            >
              {secondaryButtonText}
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
};

export default PageEmptyState;
