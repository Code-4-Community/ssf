import React, { useEffect, useState } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { Box, Flex, Text, VStack } from '@chakra-ui/react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { signOut } from 'aws-amplify/auth';
import { ChevronDown, ChevronRight, LogOut } from 'lucide-react';
import ApiClient from '@api/apiClient';
import { Role, User } from '../types/types';
import { ROUTES } from '../routes';

const ROLE_MAP: Record<Role, { label: string }> = {
  [Role.ADMIN]: { label: 'Admin' },
  [Role.VOLUNTEER]: { label: 'Volunteer' },
  [Role.PANTRY]: { label: 'Pantry' },
  [Role.FOODMANUFACTURER]: { label: 'Food Manufacturer' },
};

// Nav Structure Types
type FlatNav = { type: 'flat'; label: string; to: string };
type GroupNav = {
  type: 'group';
  label: string;
  children: Array<{ label: string; to: string }>;
};
type NavSection = FlatNav | GroupNav;

// Role Nav Definitions
const ROLE_NAV_SECTIONS: Record<Role, NavSection[]> = {
  [Role.ADMIN]: [
    {
      type: 'group',
      label: 'Volunteers',
      children: [
        { label: 'Volunteer Management', to: ROUTES.VOLUNTEER_MANAGEMENT },
      ],
    },
    {
      type: 'group',
      label: 'Pantries',
      children: [{ label: 'Application Review', to: ROUTES.APPROVE_PANTRIES }],
    },
    {
      type: 'group',
      label: 'Orders',
      children: [
        { label: 'Order Management', to: ROUTES.ADMIN_ORDER_MANAGEMENT },
      ],
    },
    {
      type: 'group',
      label: 'Manufacturers',
      children: [
        { label: 'Donation Management', to: ROUTES.ADMIN_DONATION },
        { label: 'Application Review', to: ROUTES.APPROVE_FOOD_MANUFACTURERS },
        { label: 'Donation Statistics', to: ROUTES.ADMIN_DONATION_STATS },
      ],
    },
  ],
  [Role.VOLUNTEER]: [
    {
      type: 'flat',
      label: 'Assigned Pantries',
      to: ROUTES.VOLUNTEER_ASSIGNED_PANTRIES,
    },
    {
      type: 'group',
      label: 'Orders',
      children: [
        {
          label: 'Order Management',
          to: ROUTES.VOLUNTEER_ORDER_MANAGEMENT,
        },
        {
          label: 'Food Request Management',
          to: ROUTES.VOLUNTEER_REQUEST_MANAGEMENT,
        },
      ],
    },
  ],
  [Role.FOODMANUFACTURER]: [
    {
      type: 'group',
      label: 'Donations',
      children: [
        { label: 'Donation Management', to: ROUTES.FM_DONATION_MANAGEMENT },
      ],
    },
  ],
  [Role.PANTRY]: [
    {
      type: 'group',
      label: 'Orders',
      children: [
        { label: 'Order Management', to: ROUTES.PANTRY_ORDER_MANAGEMENT },
        { label: 'Food Requests', to: ROUTES.REQUEST_FORM },
      ],
    },
  ],
};

// Subcomponents
const NavLink: React.FC<{
  to: string;
  label: string;
  isActive: boolean;
  fontWeight?: string | number;
}> = ({ to, label, isActive, fontWeight }) => (
  <RouterLink to={to} style={{ width: '100%' }}>
    <Box
      h="32px"
      px={3}
      borderRadius="5px"
      display="flex"
      alignItems="center"
      bg={isActive ? 'neutral.100' : 'transparent'}
      _hover={{ bg: 'neutral.100' }}
      cursor="pointer"
    >
      <Text fontSize="14px" color="neutral.800" fontWeight={fontWeight}>
        {label}
      </Text>
    </Box>
  </RouterLink>
);

interface NavGroupProps {
  label: string;
  children: Array<{ label: string; to: string }>;
  isOpen: boolean;
  onToggle: () => void;
  activePath: string;
}

const NavGroup: React.FC<NavGroupProps> = ({
  label,
  children,
  isOpen,
  onToggle,
  activePath,
}) => (
  <Box w="full">
    <Box
      h="32px"
      px={3}
      borderRadius="5px"
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      cursor="pointer"
      _hover={{ bg: 'neutral.100' }}
      onClick={onToggle}
      w="full"
    >
      <Text fontSize="14px" color="neutral.800" fontWeight="600">
        {label}
      </Text>
      {isOpen ? (
        <ChevronDown size={10} color="var(--chakra-colors-neutral-800)" />
      ) : (
        <ChevronRight size={10} color="var(--chakra-colors-neutral-800)" />
      )}
    </Box>

    {isOpen &&
      children.map((child) => {
        const isActive = activePath === child.to;
        return (
          <Box
            key={child.to}
            display="flex"
            alignItems="center"
            h="32px"
            pl="8px"
            pr="8px"
            w="full"
          >
            <Box position="relative" w="15px" h="20px" flexShrink={0}>
              <Box
                position="absolute"
                left="calc(50% + 3px)"
                top="-6px"
                h="32px"
                w="1px"
                bg="neutral.300"
                transform="translateX(-50%)"
              />
            </Box>

            <RouterLink to={child.to} style={{ flex: 1, paddingLeft: '10px' }}>
              <Box
                px={1}
                py={1}
                borderRadius="5px"
                bg={isActive ? 'neutral.100' : 'transparent'}
                _hover={{ bg: 'neutral.100' }}
                cursor="pointer"
              >
                <Text fontSize="14px" color="neutral.800">
                  {child.label}
                </Text>
              </Box>
            </RouterLink>
          </Box>
        );
      })}
  </Box>
);

const Navbar: React.FC = () => {
  const { authStatus } = useAuthenticator((context) => [context.authStatus]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (authStatus === 'authenticated') {
      ApiClient.getMe()
        .then(setCurrentUser)
        .catch(() => setCurrentUser(null));
    } else {
      setCurrentUser(null);
    }
  }, [authStatus]);

  // On reload or navigation, make sure the currently opened groups stays open
  useEffect(() => {
    if (!currentUser) return;
    const sections = ROLE_NAV_SECTIONS[currentUser.role];
    setOpenGroups((prev) => {
      const next = new Set(prev);
      sections.forEach((s) => {
        if (
          s.type === 'group' &&
          s.children.some((c) => c.to === location.pathname)
        ) {
          next.add(s.label);
        }
      });
      return next;
    });
  }, [location.pathname, currentUser]);

  if (authStatus !== 'authenticated' || !currentUser) return null;

  const roleLabel = ROLE_MAP[currentUser.role].label;
  const sections: NavSection[] = ROLE_NAV_SECTIONS[currentUser.role];
  const email = currentUser.email;

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  const handleSignOut = async () => {
    await signOut();
    navigate(ROUTES.LOGIN, { replace: true });
  };

  return (
    <Flex
      direction="column"
      w="240px"
      minH="100vh"
      bg="neutral.50"
      borderRightWidth="1px"
      borderRightColor="neutral.200"
      px={4}
      pt="29px"
      pb={4}
      flexShrink={0}
    >
      <RouterLink
        to={ROUTES.PROFILE}
        style={{ width: '100%', marginBottom: '24px' }}
      >
        <Box
          bg="white.core"
          borderWidth="1px"
          borderColor="neutral.200"
          borderRadius="6px"
          p={3}
          display="flex"
          alignItems="center"
          gap={3}
          cursor="pointer"
          _hover={{ borderColor: 'neutral.300' }}
        >
          <Box w="29px" h="29px" flexShrink={0}>
            <img
              src="/favicon.ico"
              alt="SSF logo"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </Box>
          <Box overflow="hidden">
            <Text
              fontSize="14px"
              color="neutral.800"
              fontWeight="normal"
              lineHeight="1.5"
              overflow="hidden"
              style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}
            >
              {roleLabel ? `${roleLabel} Dashboard` : 'Dashboard'}
            </Text>
            <Text
              fontSize="10px"
              color="neutral.700"
              lineHeight="1.5"
              overflow="hidden"
              style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}
            >
              {email}
            </Text>
          </Box>
        </Box>
      </RouterLink>

      <VStack align="stretch" gap={0} flex={1}>
        <NavLink
          fontWeight="600"
          to={ROUTES.HOME}
          label="Dashboard"
          isActive={location.pathname === ROUTES.HOME}
        />

        {sections.map((section) =>
          section.type === 'flat' ? (
            <NavLink
              key={section.to}
              to={section.to}
              label={section.label}
              isActive={location.pathname === section.to}
            />
          ) : (
            <NavGroup
              key={section.label}
              label={section.label}
              children={section.children}
              isOpen={openGroups.has(section.label)}
              onToggle={() => toggleGroup(section.label)}
              activePath={location.pathname}
            />
          ),
        )}
      </VStack>

      <Box
        h="32px"
        px={3}
        borderRadius="5px"
        display="flex"
        alignItems="center"
        gap={2}
        cursor="pointer"
        _hover={{ bg: 'neutral.100' }}
        onClick={handleSignOut}
        mt={4}
      >
        <LogOut size={14} color="var(--chakra-colors-neutral-700)" />
        <Text fontSize="14px" color="neutral.700">
          Sign Out
        </Text>
      </Box>
    </Flex>
  );
};

export default Navbar;
