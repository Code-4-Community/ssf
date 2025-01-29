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

interface User {
  id: number;
  role: string;
  firstName: string;
  lastName: string;
  email: string;
}

const PantryDashboard: React.FC = () => {
  const [ssfRep, setSsfRep] = useState<User | null>(null);

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
        console.error('Failed to fetch food requests', await response.text());
        return null;
      }
    } catch (error) {
      console.error('Error fetching food requests', error);
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

  useEffect(() => {
    console.log(ssfRep);
  }, [ssfRep]);

  return (
    <>
      <VStack width="100%" padding="2" spacing={10}>
        <HStack
          width="100%"
          justify="center"
          position="relative"
          borderBottom="2px solid #e2e8f0"
          paddingBottom="8px"
        >
          <Text textAlign="center" fontSize="2xl">
            Welcome Pantry-name!
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
                  href="/"
                  _hover={{ textDecoration: 'none' }}
                  textDecoration="none"
                >
                  Profile
                </MenuItem>
                <MenuItem
                  as={Link}
                  href="/landing-page"
                  _hover={{ textDecoration: 'none' }}
                  textDecoration="none"
                >
                  Request Form
                </MenuItem>
                <MenuItem
                  as={Link}
                  href="/"
                  _hover={{ textDecoration: 'none' }}
                  textDecoration="none"
                >
                  Sign out
                </MenuItem>
              </MenuList>
            </Menu>
          </Box>
        </HStack>

        <Text textAlign="center" fontSize={'2xl'}>
          Need help? Contact your SSF representative
        </Text>

        <Card>
          <CardBody>
            <Text>
              View a summary of all your customers over the last month.
            </Text>
            <Text>Email: </Text>
            <Text>Phone: </Text>
          </CardBody>
        </Card>

        <Button
          mt="10"
          as={Link}
          href="/landing-page"
          _hover={{ textDecoration: 'none' }}
          _focus={{ textDecoration: 'none' }}
          textDecoration="none"
        >
          Request new shipment or check shipment status
        </Button>
      </VStack>
      ;
    </>
  );
};

export default PantryDashboard;
