import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  HStack,
  Text,
  VStack,
  Card,
  CardBody,
  Box,
  Link,
} from '@chakra-ui/react';
import { HamburgerIcon } from '@chakra-ui/icons';
import React, { useEffect, useState } from 'react';
import { User, Pantry } from 'types/types';

const PantryDashboard: React.FC = () => {
  const [ssfRep, setSsfRep] = useState<User | null>(null);
  const [pantry, setPantry] = useState<Pantry | null>(null);

  const getSSFRep = async (pantryId: number): Promise<User | null> => {
    try {
      const response = await fetch(`/api/pantries/${pantryId}/ssf-contact`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        return await response.json();
      } else {
        console.error('Failed to fetch SSF rep', await response.text());
        return null;
      }
    } catch (error) {
      console.error('Error fetching SSF rep', error);
      return null;
    }
  };

  useEffect(() => {
    const fetchRep = async () => {
      try {
        const data = await getSSFRep(1);
        setSsfRep(data);
      } catch (error) {
        console.error('Error fetching SSF rep', error);
      }
    };

    fetchRep();
  }, []);

  const getPantry = async (pantryId: number): Promise<Pantry | null> => {
    try {
      const response = await fetch(`/api/pantries/${pantryId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        return await response.json();
      } else {
        console.error('Failed to fetch pantry', await response.text());
        return null;
      }
    } catch (error) {
      console.error('Error fetching pantry', error);
      return null;
    }
  };

  useEffect(() => {
    const fetchPantry = async () => {
      try {
        const data = await getPantry(1); // This is a placeholder id, replace with pantry id
        setPantry(data);
      } catch (error) {
        console.error('Error fetching pantry', error);
      }
    };

    fetchPantry();
  }, []);

  return (
    <VStack width="100%" padding="2" spacing={10}>
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
          <Menu>
            <MenuButton
              as={Button}
              bg="transparent"
              size="lg"
              _hover={{ bg: 'transparent' }}
              _active={{ bg: 'transparent' }}
            >
              <HamburgerIcon w={6} h={6} />
            </MenuButton>
            <MenuList>
              <MenuItem
                as={Link}
                href="/landing-page"
                _hover={{ textDecoration: 'none' }}
                textDecoration="none"
              >
                Profile
              </MenuItem>
              <MenuItem
                as={Link}
                href="/request-form/1" // This is a placeholder id, replace with pantry id
                _hover={{ textDecoration: 'none' }}
                textDecoration="none"
              >
                Request Form
              </MenuItem>
              <MenuItem
                as={Link}
                href="/landing-page"
                _hover={{ textDecoration: 'none' }}
                textDecoration="none"
              >
                Sign out
              </MenuItem>
            </MenuList>
          </Menu>
        </Box>
      </HStack>

      <Card>
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
      </Card>

      <Button
        mt="6"
        as={Link}
        href="/request-form/1" // This is a placeholder id, replace with pantry id
        _hover={{ textDecoration: 'none' }}
        _focus={{ textDecoration: 'none' }}
        textDecoration="none"
      >
        Request new shipment or check shipment status
      </Button>
    </VStack>
  );
};

export default PantryDashboard;
