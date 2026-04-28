import React, { useState, useEffect } from 'react';
import { Box, Text, VStack, Dialog, CloseButton } from '@chakra-ui/react';
import ApiClient from '@api/apiClient';
import { Donation, DonationItem, FoodType } from 'types/types';
import { formatDate } from '@utils/utils';
import { FloatingAlert } from '@components/floatingAlert';
import { useAlert } from '../../hooks/alert';
import { useModalBodyCleanup } from '../../hooks/modalBodyCleanup';

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
  useModalBodyCleanup();
  const [items, setItems] = useState<DonationItem[]>([]);

  const [alertState, setAlertMessage] = useAlert();

  const donationId = donation.donationId;

  useEffect(() => {
    if (!isOpen) return;

    const fetchData = async () => {
      try {
        const itemsData = await ApiClient.getDonationItemsByDonationId(
          donationId,
        );

        setItems(itemsData);
      } catch {
        setAlertMessage('Error fetching donation details');
      }
    };

    fetchData();
  }, [isOpen, donationId, setAlertMessage]);

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
      {alertState && (
        <FloatingAlert
          key={alertState.id}
          message={alertState.message}
          status="error"
          timeout={6000}
        />
      )}
      <Dialog.Backdrop bg="blackAlpha.300" />

      <Dialog.Positioner>
        <Dialog.Content>
          <Dialog.CloseTrigger asChild>
            <CloseButton />
          </Dialog.CloseTrigger>

          <Dialog.Header>
            <VStack align="stretch" gap={0}>
              <Dialog.Title fontSize="lg" mb={2} fontWeight="600">
                Donation #{donationId} Stock
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
                  <Text
                    fontSize="sm"
                    fontWeight="600"
                    color="neutral.800"
                    mb={2}
                  >
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
                        color="neutral.800"
                        fontSize="sm"
                      >
                        <Box flex={1} p={3} bg="white">
                          <Text>{item.itemName}</Text>
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
                          <Text>
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
    </Dialog.Root>
  );
};

export default DonationDetailsModal;
