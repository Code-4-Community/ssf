import {
  Menu,
  Button,
  MenuButton,
  MenuList,
  MenuItem,
  Link,
  Image,
  Card,
  CardHeader,
  CardBody,
  Heading,
  Text,
  Box,
  Select,
  Stack,
  HStack,
  VStack,
} from '@chakra-ui/react';
import { HamburgerIcon } from '@chakra-ui/icons';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ApiClient from '@api/apiClient';
import { ManufacturerDetails } from 'types/types';

const FoodManufacturerDashboard: React.FC = () => {
  const { manufacturerId } = useParams<{ manufacturerId: string }>();
  const [manufacturerDetails, setManufacturerDetails] =
    useState<ManufacturerDetails>();

  useEffect(() => {
    if (!manufacturerId) {
      console.error('Error: manufacturerId is undefined');
      return;
    }

    const fetchDetails = async () => {
      try {
        const details = await ApiClient.getManufacturerDetails(
          parseInt(manufacturerId, 10),
        );
        console.log(details);
        setManufacturerDetails(details);
      } catch (error) {
        console.error('Error fetching manufacturer details: ', error);
      }
    };

    fetchDetails();
  }, [manufacturerId]);

  const HamburgerMenu = () => {
    return (
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
            href={`/donation-management`}
            _hover={{ textDecoration: 'none' }}
            textDecoration="none"
          >
            Donation Management
          </MenuItem>
          <MenuItem
            as={Link}
            href="/landing-page"
            _hover={{ textDecoration: 'none' }}
            textDecoration="none"
          >
            Orders
          </MenuItem>
          <MenuItem
            as={Link}
            href="/landing-page"
            _hover={{ textDecoration: 'none' }}
            textDecoration="none"
          >
            Donation Statistics
          </MenuItem>
          <MenuItem
            as={Link}
            href="/landing-page"
            _hover={{ textDecoration: 'none' }}
            textDecoration="none"
          >
            Sign Out
          </MenuItem>
        </MenuList>
      </Menu>
    );
  };

  const ManufacturerCard = () => {
    return (
      <Card mx={40} variant="elevated" boxShadow="0 4px 8px rgba(0, 0, 0, 0.2)">
        <CardHeader display="flex" alignItems="center" justifyContent="center">
          <Heading size="md">
            Welcome to Food Manufacturer Admin page - FOODMANID
          </Heading>
        </CardHeader>

        <CardBody display="flex" alignItems="center" justifyContent="center">
          <Stack width="100%">
            <ManufacturerDetailsBox></ManufacturerDetailsBox>
            <UpdateFrequencyBox></UpdateFrequencyBox>
          </Stack>
        </CardBody>
      </Card>
    );
  };

  const ManufacturerDetailsBox = () => {
    return (
      <Box bg="gray.200" width="100%" padding="4" color="black">
        <Heading size="md">About Manufacturer 1:</Heading>
        <br />
        <VStack align="start" spacing={4} width="70%">
          <HStack spacing={8} align="center" width="100%">
            <Box flex="1">
              <Text>Assigned SSF Contact:</Text>
            </Box>
            <Box flex="1" textAlign="right">
              <Text>Pantry Partner since</Text>
            </Box>
          </HStack>

          <HStack spacing={8} align="center" width="100%">
            <Box flex="1">
              <Text>Total donations:</Text>
            </Box>
            <Box flex="1" textAlign="right">
              <Text>Manufacturer Industry:</Text>
            </Box>
          </HStack>

          <HStack spacing={8} align="center" width="100%">
            <Box flex="1">
              <Text>Email Address:</Text>
            </Box>
            <Box flex="1" textAlign="right">
              <Text>Phone Number:</Text>
            </Box>
          </HStack>

          <HStack spacing={8} align="center" width="100%">
            <Box flex="1">
              <Text>Address for Food Shipments:</Text>
            </Box>
          </HStack>
        </VStack>
      </Box>
    );
  };

  const UpdateFrequencyBox = () => {
    return (
      <Box
        bg="gray.200"
        width="100%"
        padding="4"
        color="black"
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
      >
        <Heading size="md">Update Frequency of Donations</Heading>
        <br />
        Current Frequency: x donations a month
        <Box
          bg="white"
          width="75% "
          my={'6'}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <HStack
            width="50%"
            my={'6'}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Text>A donation </Text>
            <Select width="50%" placeholder="Period of time">
              <option value="weekly">Weekly</option>
              <option value="biweekly">Biweekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </Select>
          </HStack>
        </Box>
        <Button bg={'gold'}>Confirm update</Button>
      </Box>
    );
  };

  return (
    <>
      <Box display="flex" justifyContent="flex-end" my={6}>
        <HamburgerMenu />
      </Box>
      <Box display="flex" alignItems="center" justifyContent="center" my={6}>
        <Image src="/favicon.ico" alt="Icon" height="75px" />
      </Box>
      <ManufacturerCard></ManufacturerCard>
    </>
  );
};

export default FoodManufacturerDashboard;
