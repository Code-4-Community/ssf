import { Box, Center, Heading, Icon, Text, VStack } from '@chakra-ui/react';
import { FileCheck } from 'lucide-react';

import React from 'react';

const PantryApplicationSubmitted: React.FC = () => {
  return (
    <Center>
      <Box width="100%" mx="11em" my="4em">
        <Box as="section" mb="2em">
          <Heading size="3xl" fontWeight="normal" mb=".5em">
            Thank you!
          </Heading>
          <Text color="gray">Your application has been submitted.</Text>
        </Box>
        <Box
          as="section"
          bg="#FEFEFE"
          py={32}
          px={6}
          border="1px solid"
          borderColor="neutral.200"
          rounded="sm"
          alignItems="center"
          color="neutral.800"
          width="100%"
        >
          <VStack gap={4}>
            <Icon as={FileCheck} size="lg" />
            <Text fontWeight="semibold" fontSize="md">
              Application Submitted
            </Text>
            <Text color="neutral.700" fontSize="sm">
              Please check your inbox for status updates.
            </Text>
          </VStack>
        </Box>
      </Box>
    </Center>
  );
};

export default PantryApplicationSubmitted;
