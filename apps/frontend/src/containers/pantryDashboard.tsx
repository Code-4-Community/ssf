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

const PantryDashboard: React.FC = () => {
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
