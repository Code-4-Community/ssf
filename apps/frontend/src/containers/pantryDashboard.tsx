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
import { User, Pantry } from 'types/types';
import ApiClient from '@api/apiClient';
import { useParams } from 'react-router-dom';

const PantryDashboard: React.FC = () => {
  const [ssfRep, setSsfRep] = useState<User | null>(null);
  const [pantry, setPantry] = useState<Pantry | null>(null);
  const { pantryId } = useParams<{ pantryId: string }>();

  useEffect(() => {
    if (!pantryId) {
      console.error('Error: pantryId is undefined');
      return;
    }
    const fetchData = async () => {
      try {
        const [pantryData, ssfRepData] = await Promise.all([
          ApiClient.getPantry(parseInt(pantryId, 10)),
          ApiClient.getPantrySSFRep(parseInt(pantryId, 10)),
        ]);
        setPantry(pantryData);
        setSsfRep(ssfRepData);
      } catch (error) {
        console.error('Error fetching pantry data/SSFRep data', error);
      }
    };

    fetchData();
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
            <Menu.Trigger>
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
                    <Text>Profile</Text>
                  </Menu.Item>
                  <Menu.Item
                    as={Link}
                    href={`/request-form/${pantryId}`}
                    _hover={{ textDecoration: 'none', cursor: 'pointer' }}
                    textDecoration="none"
                  >
                    <Text>Request Form</Text>
                  </Menu.Item>
                  <Menu.Item
                    as={Link}
                    href="/landing-page"
                    _hover={{ textDecoration: 'none', cursor: 'pointer' }}
                    textDecoration="none"
                  >
                    <Text>Sign out</Text>
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
          <Text>Name: {ssfRep?.firstName}</Text>
          <Text>Email: {ssfRep?.email}</Text>
          <Text>Phone: {ssfRep?.phone}</Text>
        </CardBody>
      </Card.Root>

      <Button
        mt="6"
        _hover={{ textDecoration: 'none' }}
        _focus={{ textDecoration: 'none' }}
        textDecoration="none"
      >
        <Link href={`/request-form/${pantryId}`}>
          Request new shipment or check shipment status
        </Link>
      </Button>
    </VStack>
  );
};

export default PantryDashboard;
