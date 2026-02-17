import React, { useState, useEffect } from 'react';
import {
  Box,
  Text,
  VStack,
  Dialog,
  Portal,
  CloseButton,
} from '@chakra-ui/react';
import ApiClient from '@api/apiClient';
import { Donation, DonationItem, FoodType } from 'types/types';
import { formatDate } from '@utils/utils';

interface DonationDetailsModalProps {
  donation: Donation;
  isOpen: boolean;
  onClose: () => void;
}

const DonationDetailsModal: React.FC<DonationDetailsModalProps> = ({
  donation,
  isOpen,
  onClose,
}) => {
  const [items, setItems] = useState<DonationItem[]>([]);

  const donationId = donation.donationId;

  useEffect(() => {
    if (!isOpen) return;

    const fetchData = async () => {
      try {
        const itemsData = await ApiClient.getDonationItemsByDonationId(
          donationId,
        );

        setItems(itemsData);
      } catch (err) {
        alert('Error fetching donation details: ' + err);
      }
    };

    fetchData();
  }, [isOpen, donationId]);

  // Group items by food type
  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.foodType]) acc[item.foodType] = [];
    acc[item.foodType].push(item);
    return acc;
  }, {} as Record<FoodType, DonationItem[]>);

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(e: { open: boolean }) => {
        if (!e.open) onClose();
      }}
      closeOnInteractOutside
      scrollBehavior="inside"
    >
      <Portal>
        <Dialog.Backdrop bg="blackAlpha.300" />

        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.CloseTrigger asChild>
              <CloseButton />
            </Dialog.CloseTrigger>

            <Dialog.Header>
              <VStack align="stretch" gap={0}>
                <Dialog.Title fontSize="lg" mb={2} fontWeight="600">
                  Donation #{donationId} Details
                </Dialog.Title>
                <Text fontSize="sm">
                  {donation.foodManufacturer?.foodManufacturerName}
                </Text>
                <Text fontSize="sm">{formatDate(donation.dateDonated)}</Text>
              </VStack>
            </Dialog.Header>

            <Dialog.Body>
              <VStack align="stretch" gap={4} my={2}>
                {Object.entries(groupedItems).map(([foodType, typeItems]) => (
                  <Box key={foodType}>
                    <Text fontSize="md" fontWeight="600" mb={2}>
                      {foodType}
                    </Text>

                    <VStack align="stretch" gap={2}>
                      {typeItems.map((item, index) => (
                        <Box
                          key={index}
                          display="flex"
                          p={0}
                          border="1px solid"
                          borderColor="neutral.100"
                          borderRadius="md"
                          overflow="hidden"
                        >
                          <Box flex={1} p={3} bg="white">
                            <Text fontSize="sm">{item.itemName}</Text>
                          </Box>

                          <Box
                            borderLeft="1px solid"
                            borderColor="neutral.100"
                            p={3}
                            minW="50px"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            bg="white"
                          >
                            <Text fontSize="sm">
                              {item.quantity - item.reservedQuantity} of{' '}
                              {item.quantity} remaining
                            </Text>
                          </Box>
                        </Box>
                      ))}
                    </VStack>
                  </Box>
                ))}
              </VStack>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};

export default DonationDetailsModal;
