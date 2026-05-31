import { Box } from '@chakra-ui/react';
import { CircleCheck } from 'lucide-react';

interface EmptyStateProps {
  entity?: string;
  subtitle?: string;
}

const SectionEmptyState: React.FC<EmptyStateProps> = ({ entity, subtitle }) => {
  const message = subtitle ?? `You have no ${entity} at this time.`;
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
    </Box>
  );
};

export default SectionEmptyState;
