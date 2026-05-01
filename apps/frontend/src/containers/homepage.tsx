import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { ROUTES } from '../routes';
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
import { useAuthenticator } from '@aws-amplify/ui-react';

const Homepage: React.FC = () => {
  const { user } = useAuthenticator((context) => [context.user]);

  return (
    <Container maxW="container.md" py={5}>
      <VStack align="center" gap={8}>
        <Heading as="h2" size="lg" textAlign="center">
          Site Navigation
        </Heading>

        <Box w="full" textAlign="center">
          <Link asChild color="teal.500">
            <RouterLink to={ROUTES.PROFILE}>Profile View</RouterLink>
          </Link>
        </Box>
        <Box w="full">
          <Heading as="h3" size="md" mb={3} textAlign="center">
            Pantry View
          </Heading>
          <List.Root unstyled gap={2}>
            <ListItem textAlign="center">
              <Link asChild color="teal.500">
                <RouterLink to={ROUTES.PANTRY_DASHBOARD}>Dasboard</RouterLink>
              </Link>
            </ListItem>
            <ListItem textAlign="center">
              <Link asChild color="teal.500">
                <RouterLink to={ROUTES.REQUEST_FORM}>Request Form</RouterLink>
              </Link>
            </ListItem>
            <ListItem textAlign="center">
              <Link asChild color="teal.500">
                <RouterLink to={ROUTES.PANTRY_APPLICATION}>
                  Pantry Application
                </RouterLink>
              </Link>
            </ListItem>
            <ListItem textAlign="center">
              <Link asChild color="teal.500">
                <RouterLink to={ROUTES.PANTRY_ORDER_MANAGEMENT}>
                  Order Management
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
                <RouterLink to={ROUTES.FM_DONATION_MANAGEMENT}>
                  Donation Management
                </RouterLink>
              </Link>
            </ListItem>
            <ListItem textAlign="center">
              <Link asChild color="teal.500">
                <RouterLink to={ROUTES.FOOD_MANUFACTURER_APPLICATION}>
                  Food Manufacturer Application
                </RouterLink>
              </Link>
            </ListItem>
          </List.Root>
        </Box>

        <Box w="full">
          <Heading as="h3" size="md" mb={3} textAlign="center">
            Volunteer View
          </Heading>
          <List.Root unstyled gap={2}>
            <ListItem textAlign="center">
              <Link asChild color="teal.500">
                <RouterLink to={ROUTES.VOLUNTEER_DASHBOARD}>
                  Dashboard
                </RouterLink>
              </Link>
            </ListItem>
            <ListItem textAlign="center">
              <Link asChild color="teal.500">
                <RouterLink to={ROUTES.VOLUNTEER_ASSIGNED_PANTRIES}>
                  Assigned Pantries
                </RouterLink>
              </Link>
            </ListItem>
            <ListItem textAlign="center">
              <Link asChild color="teal.500">
                <RouterLink to={ROUTES.VOLUNTEER_REQUEST_MANAGEMENT}>
                  Food Request Management
                </RouterLink>
              </Link>
            </ListItem>
            <ListItem textAlign="center">
              <Link asChild color="teal.500">
                <RouterLink to={ROUTES.VOLUNTEER_ORDER_MANAGEMENT}>
                  Order Management
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
                <RouterLink to={ROUTES.APPROVE_PANTRIES}>
                  Approve Pantries
                </RouterLink>
              </Link>
            </ListItem>
            <ListItem textAlign="center">
              <Link asChild color="teal.500">
                <RouterLink to={ROUTES.APPROVE_FOOD_MANUFACTURERS}>
                  Approve Food Manufacturers
                </RouterLink>
              </Link>
            </ListItem>
            <ListItem textAlign="center">
              <Link asChild color="teal.500">
                <RouterLink to="/pantries">All Pantries</RouterLink>
              </Link>
            </ListItem>
            <ListItem textAlign="center">
              <Link asChild color="teal.500">
                <RouterLink to={ROUTES.VOLUNTEER_MANAGEMENT}>
                  Volunteer Management
                </RouterLink>
              </Link>
            </ListItem>
            <ListItem textAlign="center">
              <Link asChild color="teal.500">
                <RouterLink to={ROUTES.ADMIN_DONATION}>
                  Donation Management
                </RouterLink>
              </Link>
            </ListItem>
            <ListItem textAlign="center">
              <Link asChild color="teal.500">
                <RouterLink to={ROUTES.ADMIN_DONATION_STATS}>
                  Donation Statistics
                </RouterLink>
              </Link>
            </ListItem>
            <ListItem textAlign="center">
              <Link asChild color="teal.500">
                <RouterLink to={ROUTES.ADMIN_ORDER_MANAGEMENT}>
                  Order Management
                </RouterLink>
              </Link>
            </ListItem>
            <ListItem textAlign="center">
              <Link asChild color="teal.500">
                <RouterLink to={ROUTES.TEST_ADMIN_DASHBOARD}>
                  Dashboard
                </RouterLink>
              </Link>
            </ListItem>
            <ListItem textAlign="center">
              <Link asChild color="teal.500">
                <RouterLink to={ROUTES.ADMIN_REQUEST_MANAGEMENT}>
                  Food Request Management
                </RouterLink>
              </Link>
            </ListItem>
          </List.Root>
        </Box>

        {!user && (
          <Box w="full">
            <Heading as="h3" size="md" mb={3} textAlign="center">
              Other Pages
            </Heading>
            <List.Root unstyled gap={2}>
              <ListItem textAlign="center">
                <Link asChild color="teal.500">
                  <RouterLink to={ROUTES.LOGIN}>Login</RouterLink>
                </Link>
              </ListItem>
              <ListItem textAlign="center">
                <Link asChild color="teal.500">
                  <RouterLink to={ROUTES.SIGNUP}>Sign Up</RouterLink>
                </Link>
              </ListItem>
            </List.Root>
          </Box>
        )}

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
              </VStack>
            </Alert.Description>
          </Alert.Content>
        </Alert.Root>
      </VStack>
    </Container>
  );
};

export default Homepage;
