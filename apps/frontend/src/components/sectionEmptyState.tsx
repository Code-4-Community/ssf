import { Box, Text } from '@chakra-ui/react';

interface EmptyStateProps {
  entity?: string;
  subtitle?: string;
}

const SectionEmptyState: React.FC<EmptyStateProps> = ({ entity, subtitle }) => {
  const message = subtitle ?? `You have no ${entity} at this time`;
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
      <Text fontWeight="600" textStyle="p" color="neutral.800">
        Nothing to see here!
      </Text>
      <Text textStyle="p2" color="neutral.700" fontWeight="400">
        {message}
      </Text>
    </Box>
  );
};

export default SectionEmptyState;
