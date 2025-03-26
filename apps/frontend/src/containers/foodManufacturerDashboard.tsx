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
} from '@chakra-ui/react';
import { HamburgerIcon } from '@chakra-ui/icons';

const FoodManufacturerDashboard: React.FC = () => {
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
      <Card mx={40}>
        <CardHeader display="flex" alignItems="center" justifyContent="center">
          <Heading size="md">Client Report</Heading>
        </CardHeader>

        <CardBody display="flex" alignItems="center" justifyContent="center">
          <Stack>
            <ManufacturerDetailsBox></ManufacturerDetailsBox>
            <UpdateFrequencyBox></UpdateFrequencyBox>
          </Stack>
        </CardBody>
      </Card>
    );
  };

  const ManufacturerDetailsBox = () => {
    return (
      <Box background="tomato" width="100%" padding="4" color="white">
        Details
      </Box>
    );
  };

  const UpdateFrequencyBox = () => {
    return (
      <Box background="black" width="100%" padding="4" color="white">
        Frequency
        <Select placeholder="Select option">
          <option value="option1">Option 1</option>
          <option value="option2">Option 2</option>
          <option value="option3">Option 3</option>
        </Select>
        <Button>Confirm update</Button>
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
