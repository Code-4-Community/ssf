import React from 'react';
import { Box, Text, VStack } from '@chakra-ui/react';
import { ChevronRight, Package, Handshake, List } from 'lucide-react';
import { formatDate } from '@utils/utils';
import { getInitials } from '@utils/utils';
import { OrderAssignee, DashboardCardType } from '../../types/types';

export const CARD_TYPE_ICON: Record<DashboardCardType, React.ReactNode> = {
  [DashboardCardType.Donation]: <Package size={24} />,
  [DashboardCardType.FoodRequest]: <List size={24} />,
  [DashboardCardType.Order]: <Package size={24} />,
  [DashboardCardType.Action]: <Handshake size={24} />,
};

export interface DashboardCardBadge {
  label: string;
  bg?: string;
  color?: string;
}

const ASSIGNEE_COLORS = ['yellow.ssf', 'red', 'teal.ssf', 'blue.ssf'];

export interface DashboardCardProps {
  type: DashboardCardType;
  title: string;
  subtitle?: string;
  dateLabel: string;
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
  dateLabel,
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
