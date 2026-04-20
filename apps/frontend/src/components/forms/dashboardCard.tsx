import React from 'react';
import { Box, Text, VStack } from '@chakra-ui/react';
import { ChevronRight, Package, Handshake, List } from 'lucide-react';
import {
  formatDate,
  getInitials,
  ORDER_STATUS_COLORS,
  DONATION_STATUS_COLORS,
} from '@utils/utils';
import {
  OrderAssignee,
  DashboardCardType,
  OrderStatus,
  DonationStatus,
  FoodRequestStatus,
} from '../../types/types';

export const CARD_TYPE_ICON: Record<DashboardCardType, React.ReactNode> = {
  [DashboardCardType.Donation]: <Package size={24} />,
  [DashboardCardType.FoodRequest]: <List size={24} />,
  [DashboardCardType.Order]: <Package size={24} />,
  [DashboardCardType.Action]: <Handshake size={24} />,
};

const CARD_TYPE_DATE_LABEL: Record<DashboardCardType, string> = {
  [DashboardCardType.Action]: 'Applied',
  [DashboardCardType.Order]: 'Requested',
  [DashboardCardType.Donation]: 'Donated',
  [DashboardCardType.FoodRequest]: 'Requested',
};

export interface DashboardCardBadge {
  label: string;
  bg?: string;
  color?: string;
}

export const ORDER_STATUS_BADGE: Record<OrderStatus, DashboardCardBadge> = {
  [OrderStatus.SHIPPED]: {
    label: 'In Progress',
    bg: ORDER_STATUS_COLORS[OrderStatus.SHIPPED][0],
    color: ORDER_STATUS_COLORS[OrderStatus.SHIPPED][1],
  },
  [OrderStatus.PENDING]: {
    label: 'Pending',
    bg: ORDER_STATUS_COLORS[OrderStatus.PENDING][0],
    color: ORDER_STATUS_COLORS[OrderStatus.PENDING][1],
  },
  [OrderStatus.DELIVERED]: {
    label: 'Received',
    bg: ORDER_STATUS_COLORS[OrderStatus.DELIVERED][0],
    color: ORDER_STATUS_COLORS[OrderStatus.DELIVERED][1],
  },
};

export const DONATION_STATUS_BADGE: Record<DonationStatus, DashboardCardBadge> =
  {
    [DonationStatus.MATCHED]: {
      label: 'Matched',
      bg: DONATION_STATUS_COLORS[DonationStatus.MATCHED][0],
      color: DONATION_STATUS_COLORS[DonationStatus.MATCHED][1],
    },
    [DonationStatus.AVAILABLE]: {
      label: 'Available',
      bg: DONATION_STATUS_COLORS[DonationStatus.AVAILABLE][0],
      color: DONATION_STATUS_COLORS[DonationStatus.AVAILABLE][1],
    },
    [DonationStatus.FULFILLED]: {
      label: 'Fulfilled',
      bg: DONATION_STATUS_COLORS[DonationStatus.FULFILLED][0],
      color: DONATION_STATUS_COLORS[DonationStatus.FULFILLED][1],
    },
  };

export const FOOD_REQUEST_STATUS_BADGE: Record<
  FoodRequestStatus,
  DashboardCardBadge
> = {
  [FoodRequestStatus.ACTIVE]: {
    label: 'Active',
    bg: 'blue.100',
    color: 'blue.ssf',
  },
  [FoodRequestStatus.CLOSED]: {
    label: 'Closed',
    bg: 'neutral.100',
    color: 'neutral.600',
  },
};

const ASSIGNEE_COLORS = ['yellow.ssf', 'red', 'teal.ssf', 'blue.ssf'];

export interface DashboardCardProps {
  type: DashboardCardType;
  title: string;
  subtitle?: string;
  dateLabel?: string;
  date: string;
  linkText: string;
  badge?: DashboardCardBadge;
  onLinkClick?: () => void;
  assignee?: OrderAssignee;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  type,
  title,
  subtitle,
  dateLabel = CARD_TYPE_DATE_LABEL[type],
  date,
  linkText,
  badge,
  onLinkClick,
  assignee,
}) => {
  return (
    <Box
      border="1px solid"
      borderColor="neutral.100"
      borderRadius="14px"
      p={6}
      bg="white"
      display="flex"
      flexDirection="column"
      gap={3}
      w="full"
    >
      <Box
        display="flex"
        alignItems="flex-start"
        justifyContent="space-between"
        gap={3}
      >
        <Box display="flex" alignItems="center" gap={4} mb={2}>
          <Box
            flexShrink={0}
            border="1px solid"
            borderColor="neutral.200"
            borderRadius="10px"
            padding={2}
            color="var(--chakra-colors-neutral-600)"
            textStyle="p"
            fontWeight={400}
          >
            {CARD_TYPE_ICON[type]}
          </Box>
          <VStack gap={0} alignItems="flex-start">
            <Text color="neutral.500" lineHeight="1.1">
              {dateLabel} {formatDate(date)}
            </Text>
            <Text color="black" lineHeight="1.1">
              {title}
            </Text>
          </VStack>
        </Box>

        {badge && (
          <Box
            px={2}
            py={0.5}
            borderRadius="4px"
            bg={badge.bg ?? 'neutral.100'}
            color={badge.color ?? 'neutral.600'}
            textStyle="p3"
            fontWeight={500}
            flexShrink={0}
          >
            {badge.label}
          </Box>
        )}
      </Box>

      {subtitle && (
        <Text textStyle="p" color="neutral.800" fontWeight={400}>
          {subtitle}
        </Text>
      )}

      {(linkText || assignee) && (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          pt={3}
          borderTop="1px solid"
          borderColor="neutral.100"
        >
          {linkText ? (
            <Box
              display="flex"
              alignItems="center"
              gap={2}
              color="neutral.600"
              cursor="pointer"
              onClick={onLinkClick}
              _hover={{ color: 'neutral.900' }}
            >
              <Text textStyle="p" fontWeight={500}>
                {linkText}
              </Text>
              <ChevronRight size={16} />
            </Box>
          ) : (
            <Box />
          )}

          {assignee && (
            <Box
              w="30px"
              h="30px"
              borderRadius="full"
              bg={ASSIGNEE_COLORS[assignee.id % ASSIGNEE_COLORS.length]}
              color="white"
              display="flex"
              alignItems="center"
              justifyContent="center"
              textStyle="p2"
              flexShrink={0}
            >
              {getInitials(assignee.firstName, assignee.lastName)}
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default DashboardCard;
