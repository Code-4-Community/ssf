import React from 'react';
import { Box, Text, VStack } from '@chakra-ui/react';
import { ChevronRight, Package, Handshake, List } from 'lucide-react';
import {
  formatDate,
  getInitials,
  ORDER_STATUS_COLORS,
  DONATION_STATUS_COLORS,
  ASSIGNEE_COLORS,
} from '@utils/utils';
import { OrderAssignee, OrderStatus, DonationStatus } from '../types/types';

export enum DashboardCardType {
  UPCOMING_DONATION,
  RECENT_DONATION,
  FOOD_REQUEST,
  ORDER,
  ACTION,
}

export const CARD_TYPE_ICON: Record<DashboardCardType, React.ReactNode> = {
  [DashboardCardType.RECENT_DONATION]: <Package size={24} />,
  [DashboardCardType.FOOD_REQUEST]: <List size={24} />,
  [DashboardCardType.UPCOMING_DONATION]: <List size={24} />,
  [DashboardCardType.ORDER]: <Package size={24} />,
  [DashboardCardType.ACTION]: <Handshake size={24} />,
};

const CARD_TYPE_DATE_LABEL: Record<DashboardCardType, string> = {
  [DashboardCardType.ACTION]: 'Applied',
  [DashboardCardType.ORDER]: 'Requested',
  [DashboardCardType.UPCOMING_DONATION]: 'Scheduled',
  [DashboardCardType.RECENT_DONATION]: 'Donated',
  [DashboardCardType.FOOD_REQUEST]: 'Requested',
};

export interface DashboardCardBadge {
  label: string;
  bg: string;
  color: string;
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

export interface DashboardCardProps {
  type: DashboardCardType;
  title: string;
  date: string;
  linkText: string;
  onLinkClick: () => void;
  subtitle?: string;
  badge?: DashboardCardBadge;
  assignee?: OrderAssignee;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  type,
  title,
  subtitle,
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
      pb={4}
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
            borderColor={badge?.bg ?? 'neutral.200'}
            borderRadius="10px"
            padding={2}
            bg={badge?.bg ?? 'neutral.50'}
            color={badge?.color ?? 'neutral.600'}
            textStyle="p"
            fontWeight={400}
          >
            {CARD_TYPE_ICON[type]}
          </Box>
          <VStack gap={0} alignItems="flex-start">
            <Text color="neutral.500" lineHeight="1.1">
              {CARD_TYPE_DATE_LABEL[type]} {formatDate(date)}
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
            bg={badge.bg}
            color={badge.color}
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

      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        pt={4}
        borderTop="1px solid"
        borderColor="neutral.100"
      >
        <Box
          display="flex"
          alignItems="center"
          gap={2}
          color="neutral.600"
          cursor="pointer"
          // TODO: implement nav accordingly
          onClick={onLinkClick}
          _hover={{ color: 'neutral.700' }}
        >
          <Text textStyle="p" fontWeight={500}>
            {linkText}
          </Text>
          <ChevronRight size={16} />
        </Box>

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
    </Box>
  );
};

export default DashboardCard;
