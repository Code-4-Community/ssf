import React from 'react';
import { Box, Button } from '@chakra-ui/react';
import { CircleCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PageEmptyStateProps {
  entity?: string;
  subtitle?: string;
  primaryButtonText: string;
  primaryButtonLink: string;
  secondaryButtonText: string;
  secondaryButtonLink: string;
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

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      textAlign="center"
      fontFamily="'Inter', sans-serif"
      fontSize="sm"
      color="neutral.600"
      py={10}
      gap={2}
    >
      <Box mb={2}>
        <CircleCheck size={24} color="#262626" />
      </Box>
      <Box fontWeight="600" fontSize="lg" color="neutral.800">
        Nothing to see here.
      </Box>
      <Box color="neutral.700" fontWeight="400">
        {message}
      </Box>
      <Box display="flex" gap={3} mt={4}>
        <Button
          bg="neutral.700"
          color="white"
          _hover={{ bg: 'neutral.800' }}
          onClick={() => navigate(primaryButtonLink)}
        >
          {primaryButtonText}
        </Button>
        <Button
          bg="neutral.300"
          color="neutral.700"
          _hover={{ bg: 'neutral.50' }}
          onClick={() => navigate(secondaryButtonLink)}
        >
          {secondaryButtonText}
        </Button>
      </Box>
    </Box>
  );
};

export default PageEmptyState;
