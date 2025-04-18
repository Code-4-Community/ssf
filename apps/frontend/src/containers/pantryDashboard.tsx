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
                href={`/request-form/${pantryId}`}
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
        href={`/request-form/${pantryId}`}
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
