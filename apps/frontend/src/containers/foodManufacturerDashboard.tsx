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
import apiClient from '@api/apiClient';

const FoodManufacturerDashboard: React.FC = () => {
  const { manufacturerId } = useParams<{ manufacturerId: string }>();
  const [manufacturerDetails, setManufacturerDetails] =
    useState<ManufacturerDetails>();
  const [currentSelectedFrequency, setCurrentSelectedFrequency] =
    useState<string>();

  useEffect(() => {
    if (!manufacturerId) {
      console.error('Error: manufacturerId is undefined');
      return;
    }

    const fetchDetails = async () => {
      try {
        const response = await ApiClient.getManufacturerDetails(
          parseInt(manufacturerId, 10),
        );
        setManufacturerDetails(response);
        setCurrentSelectedFrequency(response.donationFrequency);
      } catch (error) {
        console.error('Error fetching manufacturer details: ', error);
      }
    };

    fetchDetails();
  }, [manufacturerId]);

  const handleUpdate = async () => {
    try {
      if (manufacturerId && currentSelectedFrequency) {
        const response = await ApiClient.updateDonationFrequency(
          parseInt(manufacturerId, 10),
          currentSelectedFrequency,
        );
        alert('update frequency successful');
      }
    } catch (error) {
      console.error('Error updating manufacturer frequency: ', error);
    }
  };

  const handleFrequencyChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setCurrentSelectedFrequency(event.target.value);
  };

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
            Welcome to Food Manufacturer Admin page -{' '}
            {manufacturerDetails?.foodManufacturerName}
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
        <Heading size="md">
          About Manufacturer {manufacturerDetails?.foodManufacturerName}
        </Heading>
        <br />
        <VStack align="start" spacing={4} width="70%">
          <HStack spacing={8} align="center" width="125%">
            <Box flex="1">
              <Text>
                Assigned SSF Contact:{' '}
                {manufacturerDetails?.foodManufacturerRepresentative.firstName}{' '}
                {manufacturerDetails?.foodManufacturerRepresentative.lastName}
              </Text>
            </Box>
            <Box flex="1" textAlign="left">
              <Text>
                Pantry Partner since{' '}
                {manufacturerDetails?.signupDate.toString().substring(0, 4)}
              </Text>
            </Box>
          </HStack>

          <HStack spacing={8} align="center" width="125%">
            <Box flex="1">
              <Text>Total donations:</Text>
            </Box>
            <Box flex="1" textAlign="left">
              <Text>
                Manufacturer Industry: {manufacturerDetails?.industry}
              </Text>
            </Box>
          </HStack>

          <HStack spacing={8} align="center" width="125%">
            <Box flex="1">
              <Text>Email Address: {manufacturerDetails?.email}</Text>
            </Box>
            <Box flex="1" textAlign="left">
              <Text>Phone Number: {manufacturerDetails?.phone}</Text>
            </Box>
          </HStack>

          <HStack spacing={8} align="center" width="100%">
            <Box flex="1">
              <Text>
                Address for Food Shipments: {manufacturerDetails?.address}
              </Text>
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
        <p>
          {' '}
          Current Frequency: x donations{' '}
          {manufacturerDetails?.donationFrequency}{' '}
        </p>
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
            <Select
              width="50%"
              defaultValue={manufacturerDetails?.donationFrequency}
              onChange={handleFrequencyChange}
            >
              <option value="weekly">Weekly</option>
              <option value="biweekly">Biweekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </Select>
          </HStack>
        </Box>
        <Button onClick={handleUpdate} bg={'gold'}>
          Confirm update
        </Button>
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
