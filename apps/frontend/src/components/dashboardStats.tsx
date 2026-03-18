import { Box, SimpleGrid, Text } from '@chakra-ui/react';

type DashboardStatsProps = {
  stats: Record<string, string>;
};

// Called like: <DashboardStats stats={{ 'Food Requests': '1200', 'Orders': '50', 'Items Received': '1000', 'Value Received': '$40',}}></DashboardStats>
export function DashboardStats({ stats }: DashboardStatsProps) {
  const colors = ['blue.core', 'red', 'yellow.hover', 'teal.hover'];

  return (
    <SimpleGrid columns={4} gap={6} mx={8} my={4}>
      {Object.entries(stats)
        .slice(0, 4)
        .map(([key, value], index) => {
          const color = colors[index % colors.length];

          return (
            <Box
              key={key}
              px={4}
              py={3}
              textAlign="left"
              borderWidth={1}
              borderRadius={4}
              borderColor={'neutral.200'}
            >
              <Text color={color} textStyle="p2" fontWeight={500}>
                {key}
              </Text>
              <Text color={color} textStyle="h2" fontWeight={600}>
                {value}
              </Text>
            </Box>
          );
        })}
    </SimpleGrid>
  );
}
