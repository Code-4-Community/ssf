import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Heading,
  VStack,
  List,
  ListItem,
  Link,
  Text,
  Alert,
  AlertDescription,
} from '@chakra-ui/react';

const Homepage: React.FC = () => {
  return (
    <Container maxW="container.md" py={5}>
      <VStack align="center" spacing={8}>
        <Heading as="h2" size="lg" textAlign="center">
          Site Navigation
        </Heading>

        <Box w="full">
          <Heading as="h3" size="md" mb={3} textAlign="center">
            Pantry View
          </Heading>
          <List spacing={2}>
            <ListItem textAlign="center">
              <Link as={RouterLink} to="/pantry-overview" color="teal.500">
                Pantry Overview
              </Link>
            </ListItem>
            <ListItem textAlign="center">
              <Link as={RouterLink} to="/pantry-dashboard/1" color="teal.500">
                Pantry Dashboard (ID: 1)
              </Link>
            </ListItem>
            <ListItem textAlign="center">
              <Link as={RouterLink} to="/pantry-past-orders" color="teal.500">
                Past Orders
              </Link>
            </ListItem>
            <ListItem textAlign="center">
              <Link as={RouterLink} to="/pantries" color="teal.500">
                All Pantries
              </Link>
            </ListItem>
            <ListItem textAlign="center">
              <Link as={RouterLink} to="/request-form/1" color="teal.500">
                Request Form (Pantry ID: 1)
              </Link>
            </ListItem>
            <ListItem textAlign="center">
              <Link as={RouterLink} to="/pantry-application" color="teal.500">
                Pantry Application
              </Link>
            </ListItem>
          </List>
        </Box>

        <Box w="full">
          <Heading as="h3" size="md" mb={3} textAlign="center">
            Food Manufacturer View
          </Heading>
          <List spacing={2}>
            <ListItem textAlign="center">
              <Link
                as={RouterLink}
                to="/food-manufacturer-order-dashboard"
                color="teal.500"
              >
                Order Dashboard
              </Link>
            </ListItem>
            <ListItem textAlign="center">
              <Link as={RouterLink} to="/orders" color="teal.500">
                Orders
              </Link>
            </ListItem>
          </List>
        </Box>

        <Box w="full">
          <Heading as="h3" size="md" mb={3} textAlign="center">
            Admin View
          </Heading>
          <List spacing={2}>
            <ListItem textAlign="center">
              <Link as={RouterLink} to="/approve-pantries" color="teal.500">
                Approve Pantries
              </Link>
            </ListItem>
            <ListItem textAlign="center">
              <Link as={RouterLink} to="/donation-management" color="teal.500">
                Donation Management
              </Link>
            </ListItem>
          </List>
        </Box>

        <Box w="full">
          <Heading as="h3" size="md" mb={3} textAlign="center">
            Other Pages
          </Heading>
          <List spacing={2}>
            <ListItem textAlign="center">
              <Link as={RouterLink} to="/landing-page" color="teal.500">
                Landing Page
              </Link>
            </ListItem>
          </List>
        </Box>

        <Alert
          status="info"
          variant="subtle"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
          borderRadius="md"
          mt={5}
        >
          <AlertDescription>
            <VStack align="center" spacing={2}>
              <Text>
                <strong>Note:</strong> This is a temporary navigation page for
                development purposes.
              </Text>
              <Text>
                Routes with parameters are using default values (e.g., ID: 1)
              </Text>
            </VStack>
          </AlertDescription>
        </Alert>
      </VStack>
    </Container>
  );
};

export default Homepage;
