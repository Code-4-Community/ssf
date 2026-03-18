import React, { useState } from 'react';
import { Box, Tabs, HStack, Text } from '@chakra-ui/react';
import { Pencil } from 'lucide-react';

interface Tab {
  label: string;
  content: React.ReactNode;
}

interface ProfileLayoutProps {
  leftPanel: React.ReactNode;
  tabs: Tab[];
  isEditing: boolean;
  onEditToggle: () => void;
}

const EditButton: React.FC<{
  isEditing: boolean;
  onEditToggle: () => void;
}> = ({ isEditing, onEditToggle }) => (
  <HStack
    gap={1}
    color="neutral.700"
    textStyle="p2"
    fontWeight={600}
    cursor="pointer"
    pb={2}
    _hover={{ color: 'neutral.900' }}
    onClick={onEditToggle}
  >
    <Pencil size={14} />
    <Text fontWeight={600} fontFamily="ibm">
      {isEditing ? 'Editing' : 'Edit'}
    </Text>
  </HStack>
);

const ProfileLayout: React.FC<ProfileLayoutProps> = ({
  leftPanel,
  tabs,
  isEditing,
  onEditToggle,
}) => {
  const [activeTab, setActiveTab] = useState(tabs[0].label);

  return (
    <Box w="100%">
      <Box
        display="flex"
        alignItems="stretch"
        borderRadius="lg"
        borderWidth="1px"
        borderColor="neutral.100"
        overflow="hidden"
        w="100%"
        bg="neutral.50"
      >
        <Box flexShrink={0}>{leftPanel}</Box>

        <Box w="1px" bg="neutral.100" flexShrink={0} />

        <Box p={6} flex={1} bg="white" minW={0}>
          {tabs.length > 1 ? (
            <Tabs.Root
              value={activeTab}
              onValueChange={(e: { value: string }) => setActiveTab(e.value)}
              variant="line"
            >
              <HStack justify="space-between" my={4}>
                <Tabs.List>
                  {tabs.map((tab) => (
                    <Tabs.Trigger
                      key={tab.label}
                      value={tab.label}
                      color="neutral.800"
                      textStyle="p2"
                      borderBottom="1px solid"
                      borderColor="neutral.100"
                      _selected={{ borderColor: 'neutral.700' }}
                    >
                      {tab.label}
                    </Tabs.Trigger>
                  ))}
                </Tabs.List>
                <EditButton isEditing={isEditing} onEditToggle={onEditToggle} />
              </HStack>

              {tabs.map((tab) => (
                <Tabs.Content key={tab.label} value={tab.label}>
                  {tab.content}
                </Tabs.Content>
              ))}
            </Tabs.Root>
          ) : (
            <>
              <HStack justify="space-between" my={4} mx={2}>
                <Text textStyle="p" fontWeight={600}>
                  Account Details
                </Text>
                <EditButton isEditing={isEditing} onEditToggle={onEditToggle} />
              </HStack>
              {tabs[0]?.content}
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default ProfileLayout;
