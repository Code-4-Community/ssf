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
} from '@chakra-ui/react';

const Homepage: React.FC = () => {
  return (
    <Container maxW="container.md" py={5}>
      <VStack align="center" gap={8}>
        <Heading as="h2" size="lg" textAlign="center">
          Site Navigation
        </Heading>

        <Box w="full">
          <Heading as="h3" size="md" mb={3} textAlign="center">
            Pantry View
          </Heading>
          <List.Root unstyled gap={2}>
            <ListItem textAlign="center">
              <Link asChild color="teal.500">
                <RouterLink to="/pantry-overview">Pantry Overview</RouterLink>
              </Link>
            </ListItem>
            <ListItem textAlign="center">
              <Link asChild color="teal.500">
                <RouterLink to="/pantry-dashboard/1">
                  Pantry Dashboard (ID: 1)
                </RouterLink>
              </Link>
            </ListItem>
            <ListItem textAlign="center">
              <Link asChild color="teal.500">
                <RouterLink to="/pantry-past-orders">Past Orders</RouterLink>
              </Link>
            </ListItem>
            <ListItem textAlign="center">
              <Link asChild color="teal.500">
                <RouterLink to="/request-form/1">
                  Request Form (Pantry ID: 1)
                </RouterLink>
              </Link>
            </ListItem>
            <ListItem textAlign="center">
              <Link asChild color="teal.500">
                <RouterLink to="/pantry-application">
                  Pantry Application
                </RouterLink>
              </Link>
            </ListItem>
          </List.Root>
        </Box>

        <Box w="full">
          <Heading as="h3" size="md" mb={3} textAlign="center">
            Food Manufacturer View
          </Heading>
          <List.Root unstyled gap={2}>
            <ListItem textAlign="center">
              <Link asChild color="teal.500">
                <RouterLink to="/food-manufacturer-order-dashboard">
                  Order Dashboard
                </RouterLink>
              </Link>
            </ListItem>
            <ListItem textAlign="center">
              <Link asChild color="teal.500">
                <RouterLink to="/orders">Orders</RouterLink>
              </Link>
            </ListItem>
            <ListItem textAlign="center">
              <Link asChild color="teal.500">
                <RouterLink to="/donation-management">
                  Donation Management
                </RouterLink>
              </Link>
            </ListItem>
          </List.Root>
        </Box>

        <Box w="full">
          <Heading as="h3" size="md" mb={3} textAlign="center">
            Admin View
          </Heading>
          <List.Root unstyled gap={2}>
            <ListItem textAlign="center">
              <Link asChild color="teal.500">
                <RouterLink to="/approve-pantries">Approve Pantries</RouterLink>
              </Link>
            </ListItem>
            <ListItem textAlign="center">
              <Link asChild color="teal.500">
                <RouterLink to="/pantries">All Pantries</RouterLink>
              </Link>
            </ListItem>
            <ListItem textAlign="center">
              <Link asChild href="/volunteer-management" color="teal.500">
                <RouterLink to="/volunteer-management">
                  Volunteer Management
                </RouterLink>
              </Link>
            </ListItem>
            <ListItem textAlign="center">
              <Link asChild color="teal.500">
                <RouterLink to="/admin-donation">
                  Donation Management
                </RouterLink>
              </Link>
            </ListItem>
          </List.Root>
        </Box>

        <Box w="full">
          <Heading as="h3" size="md" mb={3} textAlign="center">
            Other Pages
          </Heading>
          <List.Root unstyled gap={2}>
            <ListItem textAlign="center">
              <Link asChild color="teal.500">
                <RouterLink to="/landing-page">Landing Page</RouterLink>
              </Link>
            </ListItem>
            <ListItem textAlign="center">
              <Link asChild color="teal.500">
                <RouterLink to="/pantry-overview">Pantry Overview</RouterLink>
              </Link>
            </ListItem>
            <ListItem textAlign="center">
              <Link asChild color="teal.500">
                <RouterLink to="/volunteer-assigned-pantries">Volunteer Assigned Pantries</RouterLink>
              </Link>
            </ListItem>
          </List.Root>
        </Box>

        <Alert.Root
          status="info"
          variant="subtle"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
          borderRadius="md"
          w="50%"
          mt={5}
        >
          <Alert.Content>
            <Alert.Description>
              <VStack align="center" gap={2}>
                <Text>
                  <strong>Note:</strong> This is a temporary navigation page for
                  development purposes.
                </Text>
                <Text>
                  Routes with parameters are using default values (e.g., ID: 1)
                </Text>
              </VStack>
            </Alert.Description>
          </Alert.Content>
        </Alert.Root>
      </VStack>
    </Container>
  );
};

export default Homepage;
