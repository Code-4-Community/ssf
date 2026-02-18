import {
  Menu,
  Portal,
  Button,
  HStack,
  Text,
  VStack,
  Card,
  CardBody,
  Box,
  Link,
} from '@chakra-ui/react';
import { MenuIcon } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Pantry } from 'types/types';
import ApiClient from '@api/apiClient';
import { useAuthenticator } from '@aws-amplify/ui-react';

const PantryDashboard: React.FC = () => {
  const { user } = useAuthenticator((context) => [context.user]);
  const [pantryId, setPantryId] = useState<number | null>(null);
  const [pantry, setPantry] = useState<Pantry | null>(null);

  useEffect(() => {
    const fetchPantryId = async () => {
      if (user.userId) {
        try {
          const pantryId = await ApiClient.getCurrentUserPantryId();
          setPantryId(pantryId);
        } catch (error) {
          console.error('Error fetching pantry ID', error);
        }
      }
    };

    fetchPantryId();
  }, [user.userId]);

  useEffect(() => {
    const fetchPantryData = async () => {
      if (!pantryId) return;

      try {
        const pantryData = await ApiClient.getPantry(pantryId);
        setPantry(pantryData);
      } catch (error) {
        console.error('Error fetching pantry data/SSFRep data', error);
      }
    };

    fetchPantryData();
  }, [pantryId]);

  return (
    <VStack width="100%" padding="2" gap={10}>
      <HStack
        width="100%"
        justify="center"
        position="relative"
        borderBottom="2px solid #e2e8f0"
        paddingBottom="8px"
      >
        <Text textAlign="center" fontSize="2xl">
          Welcome {pantry?.pantryName}!
        </Text>
        <Box
          position="absolute"
          right="2px"
          top="50%"
          transform="translateY(-50%)"
        >
          <Menu.Root>
            <Menu.Trigger asChild>
              <Button
                bg="transparent"
                size="lg"
                _hover={{ bg: 'transparent' }}
                _active={{ bg: 'transparent' }}
              >
                <MenuIcon color="black" size={6} />
              </Button>
            </Menu.Trigger>
            <Portal>
              <Menu.Positioner>
                <Menu.Content>
                  <Menu.Item
                    as={Link}
                    href="/landing-page"
                    _hover={{ textDecoration: 'none', cursor: 'pointer' }}
                    textDecoration="none"
                  >
                    Profile
                  </Menu.Item>
                  <Menu.Item
                    as={Link}
                    href="/request-form"
                    _hover={{ textDecoration: 'none', cursor: 'pointer' }}
                    textDecoration="none"
                  >
                    Request Form
                  </Menu.Item>
                  <Menu.Item
                    as={Link}
                    href="/landing-page"
                    _hover={{ textDecoration: 'none', cursor: 'pointer' }}
                    textDecoration="none"
                  >
                    Sign out
                  </Menu.Item>
                </Menu.Content>
              </Menu.Positioner>
            </Portal>
          </Menu.Root>
        </Box>
      </HStack>

      <Card.Root>
        <CardBody>
          <Text
            textAlign="center"
            fontSize={'2xl'}
            mb="6"
            borderBottom="2px solid #e2e8f0"
            paddingBottom="8px"
          >
            Need help? Contact your SSF representative
          </Text>
          <Text>
            Name: {pantry?.pantryUser?.firstName} {pantry?.pantryUser?.lastName}
          </Text>
          <Text>Email: {pantry?.pantryUser?.email}</Text>
          <Text>Phone: {pantry?.pantryUser?.phone}</Text>
        </CardBody>
      </Card.Root>

      <Button
        asChild
        mt="6"
        _hover={{ textDecoration: 'none' }}
        _focus={{ textDecoration: 'none' }}
        textDecoration="none"
      >
        <Link href={`/request-form`}>
          Request new shipment or check shipment status
        </Link>
      </Button>
    </VStack>
  );
};

export default PantryDashboard;
