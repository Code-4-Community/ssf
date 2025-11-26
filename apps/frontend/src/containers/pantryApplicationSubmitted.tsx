import { Box, Center, Heading, Icon, Text, VStack } from '@chakra-ui/react';
import { FileCheck } from 'lucide-react';

import React from 'react';

const PantryApplicationSubmitted: React.FC = () => {
  return (
    <Center>
      <Box width="100%" mx="11em" my="4em">
        <Box as="section" mb="2em">
          <Heading textStyle="h1" mb=".5em">
            Thank you!
          </Heading>
          <Text textStyle="p" color="gray.light">Your application has been submitted.</Text>
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
          width="100%"
        >
          <VStack gap={3}>
            <Icon as={FileCheck} size="lg" color="neutral.800"/>
            <Text color="neutral.800" fontWeight="semibold" textStyle="p">
              Application Submitted
            </Text>
            <Text color="neutral.700" textStyle="p2">
              Please check your inbox for status updates.
            </Text>
          </VStack>
        </Box>
      </Box>
    </Center>
  );
};

export default PantryApplicationSubmitted;
